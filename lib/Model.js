"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("./mysql"));
const Document_1 = __importDefault(require("./Document"));
const DocumentQuery_1 = __importDefault(require("./DocumentQuery"));
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
                                filterFileds += `${prevField} ${selectorActions[field]} ${mysql_1.default.escape(value)} OR `;
                            });
                        }
                    }
                }
                else {
                    let value = params[field];
                    if (field[0] === '$') {
                        filterFileds += `${prevField} ${selectorActions[field]} ${mysql_1.default.escape(value)}${i !== Object.keys(params).length - 1 ? ' AND ' : ''}`;
                    }
                    else {
                        filterFileds += `${field} = ${mysql_1.default.escape(value)}${i !== Object.keys(params).length - 1 ? ' AND ' : ''}`;
                    }
                }
            });
        }
    };
    closer({ params: arg });
    if (filterFileds.slice(-5) === ' AND ')
        filterFileds = filterFileds.slice(0, -5);
    if (filterFileds.slice(-4) === ' OR ')
        filterFileds = filterFileds.slice(0, -4);
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
const selectorActions = {
    $lt: '<',
    $gt: '>',
    $lte: '<=',
    $gte: '>=',
    $eq: '=',
    $ne: '!=',
    $in: 'LIKE',
    $nin: 'NOT LIKE'
};
class Model {
    constructor(name, schema, db) {
        this.schema = schema;
        this.db = db;
        this.docProps = {
            schema: this.schema,
            db: this.db,
            modelName: name
        };
    }
    get modelName() {
        return this.docProps.modelName;
    }
    new(doc) {
        return new Document_1.default(Object.assign(Object.assign({ doc }, this.docProps), { isNew: true }));
    }
    find(conditions, fields, callback) {
        if (typeof conditions === 'function') {
            callback = conditions;
            conditions = {};
            fields = null;
        }
        else if (typeof fields === 'function') {
            callback = fields;
            fields = null;
        }
        const query = new DocumentQuery_1.default(`SELECT ${getFileds(fields)} FROM ${this.modelName} ${getConditions(conditions)}`, this.docProps, 'find');
        if (callback)
            query.exec(callback);
        return query;
    }
    findOne(conditions, fields, callback) {
        if (typeof conditions === 'function') {
            callback = conditions;
            conditions = {};
            fields = null;
        }
        else if (typeof fields === 'function') {
            callback = fields;
            fields = null;
        }
        const query = new DocumentQuery_1.default(`SELECT ${getFileds(fields)} FROM ${this.modelName} ${getConditions(conditions)} LIMIT 1`, this.docProps, 'findOne');
        if (callback)
            query.exec(callback);
        return query;
    }
    findById(id, fields, callback) {
        if (typeof fields === 'function') {
            callback = fields;
            fields = null;
        }
        const query = new DocumentQuery_1.default(`SELECT ${getFileds(fields)} FROM ${this.modelName} WHERE _id = ${mysql_1.default.escape(id)} LIMIT 1`, this.docProps, 'findById');
        if (callback)
            query.exec(callback);
        return query;
    }
    insertOne(params = {}, callback) {
        try {
            const document = this.new(params);
            if (callback)
                document.save(callback);
            else
                return document.save();
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
            let query = "INSERT INTO " + this.modelName, docs = params.map((doc) => {
                return this.new(doc);
            });
            const insertNext = () => {
                let keys = Object.keys(this.schema.obj), values = "", cols = "";
                docs.forEach((row, i) => {
                    keys.forEach((key, j) => {
                        let value = mysql_1.default.escape(row[key]);
                        if (i === 0)
                            cols += `${key}${j !== keys.length - 1 ? ', ' : ''}`;
                        values += `${j === 0 ? '(' : ''}${value}${j !== keys.length - 1 ? ', ' : i === params.length - 1 ? ')' : '), '}`;
                    });
                });
                query += ` (${cols}) VALUES ${values}`;
            };
            if (this.schema.methods.save) {
                docs.forEach((doc, i) => {
                    if (this.schema.methods.save)
                        this.schema.methods.save(doc, () => { if (i === docs.length - 1)
                            insertNext(); });
                });
            }
            else
                insertNext();
            return this.checkDb(() => {
                return mysql_1.default.execute(query, this.db.db)
                    .then(() => {
                    if (callback)
                        callback(null, docs);
                    else
                        return docs;
                })
                    .catch((err) => {
                    throw err;
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
    findAndUpdate(conditions, update = {}, callback) {
        try {
            let filterFileds = getConditions(conditions);
            if (filterFileds.trim() !== "" && Object.keys(update).length > 0) {
                let query = `UPDATE ${this.modelName} SET`;
                const updateNext = () => {
                    let updateString = "";
                    Object.keys(this.schema.obj).forEach((key) => {
                        if (key !== '_id' && key !== 'id') {
                            let value = update[key];
                            if (this.schema.options.timestamps && key === '_updatedAt')
                                value = new Date();
                            if (value) {
                                value = mysql_1.default.escape(value);
                                updateString += `${key} = ${value}, `;
                            }
                        }
                    });
                    if (updateString.slice(-2) === ', ')
                        updateString = updateString.slice(0, -2);
                    query += ` ${updateString} ${filterFileds}`;
                };
                if (this.schema.methods.update)
                    this.schema.methods.update(update, updateNext);
                else
                    updateNext();
                return this.checkDb(() => {
                    return mysql_1.default.execute(query, this.db.db)
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
                let query = `UPDATE ${this.modelName} SET`;
                const updateNext = () => {
                    let updateString = "";
                    Object.keys(this.schema.obj).forEach((key) => {
                        if (key !== '_id' && key !== 'id') {
                            let value = update[key];
                            if (this.schema.options.timestamps && key === '_updatedAt')
                                value = new Date();
                            if (value) {
                                value = mysql_1.default.escape(value);
                                updateString += `${key} = ${value}, `;
                            }
                        }
                    });
                    if (updateString.slice(-2) === ', ')
                        updateString = updateString.slice(0, -2);
                    query += ` ${updateString} WHERE _id = ${mysql_1.default.escape(id)}`;
                };
                if (this.schema.methods.update)
                    this.schema.methods.update(update, updateNext);
                else
                    updateNext();
                return this.checkDb(() => {
                    return mysql_1.default.execute(query, this.db.db)
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
                let query = `DELETE FROM ${this.modelName} ${filterFileds}`;
                const deleteNext = () => {
                };
                if (this.schema.methods.delete)
                    this.schema.methods.delete({}, deleteNext);
                else
                    deleteNext();
                return this.checkDb(() => {
                    return mysql_1.default.execute(query, this.db.db)
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
                let query = `DELETE FROM ${this.modelName} WHERE _id = ${mysql_1.default.escape(id)}`;
                const deleteNext = () => {
                };
                if (this.schema.methods.delete)
                    this.schema.methods.delete({}, deleteNext);
                else
                    deleteNext();
                return this.checkDb(() => {
                    return mysql_1.default.execute(query, this.db.db)
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
    countDocuments(conditions, callback) {
        try {
            let query = `SELECT COUNT(*) FROM ${this.modelName} ${getConditions(conditions)}`;
            return this.checkDb(() => {
                return mysql_1.default.execute(query, this.db.db).then(([res]) => {
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
    checkDb(next) {
        return mysql_1.default.execute(`CREATE TABLE IF NOT EXISTS ${this.modelName} (${this.schema.query})`)
            .then(() => {
            return next();
        })
            .catch((err) => {
            throw err;
        });
    }
}
exports.default = Model;
