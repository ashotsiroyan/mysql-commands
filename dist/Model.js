"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("./mysql"));
const actions_1 = __importDefault(require("./plugins/actions"));
const ObjectId_1 = __importDefault(require("./plugins/ObjectId"));
const Document_1 = __importDefault(require("./Document"));
const pool = mysql_1.default.pool;
function getConditions(arg) {
    let filterFileds = "";
    const closer = ({ params, prevField = null }) => {
        if (params) {
            Object.keys(params).forEach((field, i) => {
                if (typeof params[field] === 'object') {
                    if (field === '$or' || field === '$and') {
                        params[field].forEach((option, j) => {
                            filterFileds += "(";
                            closer({ params: option });
                            if (filterFileds.slice(-5) === ' AND ')
                                filterFileds = filterFileds.slice(0, -5);
                            filterFileds += `)${j !== params[field].length - 1 ? ` ${field === '$or' ? "OR" : "AND"} ` : ""}`;
                        });
                    }
                    else {
                        if (!Array.isArray(params[field])) {
                            closer({ params: params[field], prevField: field });
                        }
                        else if (field === '$in' || field === '$nin') {
                            params[field].forEach((value) => {
                                filterFileds += `${prevField} ${actions_1.default[field]} ${pool.escape(value)} AND `;
                            });
                        }
                    }
                }
                else {
                    let value = params[field];
                    // if(typeof value === 'string')
                    //     value = "'" + value + "'";
                    if (field[0] === '$') {
                        filterFileds += `${prevField} ${actions_1.default[field]} ${pool.escape(value)}${i !== Object.keys(params).length - 1 ? ' AND ' : ''}`;
                    }
                    else {
                        filterFileds += `${field} = ${pool.escape(value)}${i !== Object.keys(params).length - 1 ? ' AND ' : ''}`;
                    }
                }
            });
        }
    };
    closer({ params: arg });
    if (filterFileds.slice(-5) === ' AND ')
        filterFileds = filterFileds.slice(0, -5);
    if (filterFileds.trim() !== "")
        filterFileds = "WHERE " + filterFileds;
    return filterFileds;
}
function getFileds(arg) {
    let showFileds = arg && arg.length > 0 ? "" : "*";
    if (arg && arg.length > 0)
        arg.forEach((field, i) => {
            showFileds += `${field}${i !== arg.length - 1 ? ', ' : ''}`;
        });
    return showFileds;
}
class Model {
    constructor(table, SchemaParams) {
        this.query = {
            main: "",
            skip: "",
            sort: "",
            limit: "",
            err: null
        };
        this.mysqlStructure = SchemaParams.sqlString;
        this.methods = SchemaParams.methods;
        this.documentParams = {
            schema: SchemaParams.definition,
            options: SchemaParams.options,
            preSave: this.methods['save'] ? this.methods['save'] : undefined,
            table: table
        };
    }
    get schema() {
        return this.documentParams.schema;
    }
    get tableName() {
        return this.documentParams.table;
    }
    new(doc = {}) {
        return new Document_1.default(Object.assign(Object.assign({ doc }, this.documentParams), { checkDb: this.checkDb.bind(this), isNew: true }));
    }
    find(conditions, fields) {
        let query = "SELECT";
        query += ` ${getFileds(fields)} FROM ${this.tableName} ${getConditions(conditions)}`;
        this.query.main = query;
        return this;
    }
    findOne(conditions, fields) {
        let query = "SELECT";
        query += ` ${getFileds(fields)} FROM ${this.tableName} ${getConditions(conditions)} LIMIT 1`;
        this.query.main = query;
        return this;
    }
    findById(id, fields) {
        if (id) {
            let query = "SELECT";
            query += ` ${getFileds(fields)} FROM ${this.tableName} WHERE _id = ${pool.escape(id)} LIMIT 1`;
            this.query.main = query;
            return this;
        }
        else {
            this.query.err = "ID isn't filled.";
        }
    }
    insertOne(params = {}, callback) {
        try {
            const document = new Document_1.default(Object.assign(Object.assign({ doc: params }, this.documentParams), { checkDb: this.checkDb.bind(this), isNew: true }));
            return document.save(callback);
        }
        catch (err) {
            if (callback)
                callback(err);
            else
                throw err;
        }
    }
    insertMany(params = [], callback) {
        try {
            let query = "INSERT INTO " + this.tableName, values = "", cols = "";
            const hasId = this.documentParams.options._id === undefined || this.documentParams.options._id ? true : false;
            const insert = () => {
                let keys = Object.keys(this.schema);
                params.forEach((row, i) => {
                    keys.forEach((key, j) => {
                        let defaultValue = undefined, value = '';
                        if (typeof this.schema[key] !== 'string') {
                            defaultValue = this.schema[key].default;
                        }
                        if (row[key])
                            value = row[key];
                        else if (defaultValue)
                            value = defaultValue;
                        if (hasId && key === '_id')
                            value = ObjectId_1.default();
                        value = pool.escape(value);
                        if (i === 0)
                            cols += `${key}${j !== keys.length - 1 ? ', ' : ''}`;
                        values += `${j === 0 ? '(' : ''}${value}${j !== keys.length - 1 ? ', ' : i === params.length - 1 ? ')' : '), '}`;
                    });
                });
                query += ` (${cols}) VALUES ${values}`;
                return this.checkDb(() => {
                    return pool.execute(query)
                        .then(() => {
                        if (callback)
                            callback(null);
                        else
                            return true;
                    })
                        .catch((err) => {
                        throw err;
                    });
                });
            };
            if (this.methods.save !== undefined) {
                params.forEach((obj, i) => {
                    if (this.methods.save !== undefined)
                        this.methods.save(obj, () => { if (i === params.length - 1)
                            insert(); });
                });
            }
            else
                insert();
        }
        catch (err) {
            if (callback)
                callback(err);
            else
                throw err;
        }
    }
    findAndUpdate(conditions, update = {}, callback) {
        try {
            let filterFileds = getConditions(conditions);
            if (filterFileds.trim() !== "" && Object.keys(update).length > 0) {
                let query = `UPDATE ${this.tableName} SET`, updateString = "";
                const insert = () => {
                    Object.keys(this.schema).forEach((key) => {
                        if (key !== '_id' && key !== 'id') {
                            let value = update[key];
                            if (this.documentParams.options.timestamps && key === '_updatedAt')
                                value = new Date();
                            if (value) {
                                value = pool.escape(value);
                                updateString += `${key} = ${value}, `;
                            }
                        }
                    });
                    query += ` ${updateString.slice(0, -2)} ${filterFileds}`;
                    return this.checkDb(() => {
                        return pool.execute(query)
                            .then(() => {
                            if (callback)
                                callback(null);
                            else
                                return true;
                        })
                            .catch((err) => {
                            throw err;
                        });
                    });
                };
                if (this.methods.update)
                    this.methods.update(update, insert);
                else
                    insert();
            }
            else if (filterFileds.trim() === "")
                throw "Filter fileds aren't filled.";
            else if (Object.keys(update).length === 0)
                throw "Update fileds aren't filled.";
        }
        catch (err) {
            if (callback)
                callback(err);
            else
                throw err;
        }
    }
    findByIdAndUpdate(id, update = {}, callback) {
        try {
            if (id && Object.keys(update).length > 0) {
                let query = `UPDATE ${this.tableName} SET`, updateString = "";
                const insert = () => {
                    Object.keys(this.schema).forEach((key) => {
                        if (key !== '_id' && key !== 'id') {
                            let value = update[key];
                            if (this.documentParams.options.timestamps && key === '_updatedAt')
                                value = new Date();
                            if (value) {
                                value = pool.escape(value);
                                updateString += `${key} = ${value}, `;
                            }
                        }
                    });
                    query += ` ${updateString.slice(0, -2)} WHERE _id = ${pool.escape(id)}`;
                    return this.checkDb(() => {
                        return pool.execute(query)
                            .then(() => {
                            if (callback)
                                callback(null);
                            else
                                return true;
                        })
                            .catch((err) => {
                            throw err;
                        });
                    });
                };
                if (this.methods.update)
                    this.methods.update(update, insert);
                else
                    insert();
            }
            else if (!id)
                throw "ID isn't filled.";
            else if (Object.keys(update).length === 0)
                throw "Update fileds aren't filled.";
        }
        catch (err) {
            if (callback)
                callback(err);
            else
                throw err;
        }
    }
    findAndDelete(conditions, callback) {
        try {
            let filterFileds = getConditions(conditions);
            if (filterFileds.trim() !== "") {
                let query = `DELETE FROM ${this.tableName} ${filterFileds}`;
                return this.checkDb(() => {
                    return pool.execute(query)
                        .then(() => {
                        if (callback)
                            callback(null);
                        else
                            return true;
                    })
                        .catch((err) => {
                        throw err;
                    });
                });
            }
            else
                throw "Filter fileds aren't filled.";
        }
        catch (err) {
            if (callback)
                callback(err);
            else
                throw err;
        }
    }
    findByIdAndDelete(id, callback) {
        try {
            if (id) {
                let query = `DELETE FROM ${this.tableName} WHERE _id = ${pool.escape(id)}`;
                return this.checkDb(() => {
                    return pool.execute(query)
                        .then(() => {
                        if (callback)
                            callback(null);
                        else
                            return true;
                    })
                        .catch((err) => {
                        throw err;
                    });
                });
            }
            else
                throw "ID isn't filled.";
        }
        catch (err) {
            if (callback)
                callback(err);
            else
                throw err;
        }
    }
    limit(val) {
        if (this.query.main !== "") {
            if (val) {
                this.query.limit = " LIMIT " + val;
            }
        }
        else
            this.query.err = "Order Error: .find().limit()";
        return this;
    }
    skip(val) {
        if (this.query.main !== "") {
            if (val) {
                this.query.skip = " OFFSET " + val;
            }
        }
        else
            this.query.err = "Order Error: .find().skip()";
        return this;
    }
    sort(arg) {
        if (this.query.main !== "") {
            if (Object.keys(arg).length > 0) {
                let query = " ORDER BY ";
                Object.keys(arg).forEach((key, i) => {
                    query += `${key} ${arg[key] === -1 ? 'DESC' : 'ASC'}${i !== Object.keys(arg).length - 1 ? ', ' : ''}`;
                });
                this.query.sort = query;
            }
        }
        else
            this.query.err = "Order Error: .find().sort()";
        return this;
    }
    countDocuments(conditions = {}, callback) {
        try {
            let query = `SELECT COUNT(*) FROM ${this.tableName} ${getConditions(conditions)}`;
            return this.checkDb(() => {
                return pool.execute(query).then(([res]) => {
                    let count = res[0]['COUNT(*)'];
                    if (callback)
                        callback(null, count);
                    else
                        return count;
                });
            });
        }
        catch (err) {
            if (callback)
                callback(err);
            else
                throw err;
        }
    }
    exec(callback) {
        try {
            if (this.query.err)
                throw this.query.err;
            let { main, limit, sort, skip } = this.query;
            if (main !== "") {
                let query = main + sort + limit + (limit !== '' ? skip : '');
                return this.checkDb(() => {
                    return pool.execute(query)
                        .then(([rows]) => {
                        this.query = {
                            main: "",
                            skip: "",
                            sort: "",
                            limit: "",
                            err: null
                        };
                        let res = rows.map((row) => {
                            return new Document_1.default(Object.assign(Object.assign({ doc: row }, this.documentParams), { checkDb: this.checkDb.bind(this) }));
                        });
                        if (callback)
                            callback(null, res);
                        else
                            return res;
                    })
                        .catch((err) => {
                        throw err;
                    });
                });
            }
            else {
                throw "Order Error: .find().exec()";
            }
        }
        catch (err) {
            this.query = {
                main: "",
                skip: "",
                sort: "",
                limit: "",
                err: null
            };
            if (callback)
                callback(err);
            else
                throw err;
        }
    }
    checkDb(next) {
        return pool.execute(`CREATE TABLE IF NOT EXISTS ${this.tableName} (${this.mysqlStructure})`)
            .then(() => {
            return next();
        })
            .catch((err) => {
            throw err;
        });
    }
}
exports.default = Model;
