"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("./mysql"));
const Document_1 = __importDefault(require("./Document"));
const Query_1 = require("./Query");
const functions_1 = require("./plugins/functions");
class Model {
    constructor(name, schema, db) {
        this.schema = schema;
        this.db = db;
        this.modelName = name;
    }
    new(doc) {
        return new Document_1.default({
            doc,
            schema: this.schema,
            db: this.db,
            modelName: this.modelName,
            isNew: true
        });
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
        const query = new Query_1.DocumentQuery(`SELECT ${functions_1.getFileds(fields)} FROM ${this.modelName} ${functions_1.getConditions(conditions)}`, this);
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
        const query = new Query_1.DocumentQuery(`SELECT ${functions_1.getFileds(fields)} FROM ${this.modelName} ${functions_1.getConditions(conditions)} LIMIT 1`, this, true);
        if (callback)
            query.exec(callback);
        return query;
    }
    findById(id, fields, callback) {
        if (typeof fields === 'function') {
            callback = fields;
            fields = null;
        }
        const query = new Query_1.DocumentQuery(`SELECT ${functions_1.getFileds(fields)} FROM ${this.modelName} WHERE _id = ${mysql_1.default.escape(id)} LIMIT 1`, this, true);
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
                        let value = mysql_1.default.escape(functions_1.withOptions(row[key], this.schema.obj[key]));
                        if (i === 0)
                            cols += `${key}${j !== keys.length - 1 ? ', ' : ''}`;
                        values += `${j === 0 ? '(' : ''}${value}${j !== keys.length - 1 ? ', ' : i === params.length - 1 ? ')' : '), '}`;
                    });
                });
                query += ` (${cols}) VALUES ${values}`;
            };
            if (this.schema.methods.insertMany) {
                this.schema.methods.insertMany(docs, insertNext);
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
    updateOne(conditions, doc = {}, callback) {
        try {
            if (Object.keys(doc).length > 0) {
                let query;
                const updateNext = () => {
                    query = `${new Query_1.Query(this).update(doc)} ${functions_1.getConditions(conditions)} LIMIT 1`;
                };
                if (this.schema.methods.update)
                    this.schema.methods.update(doc, updateNext);
                else
                    updateNext();
                return this.checkDb(() => {
                    return mysql_1.default.execute(query, this.db.db)
                        .then(() => {
                        if (callback)
                            callback(null, doc);
                        else
                            return doc;
                    })
                        .catch((err) => {
                        throw err;
                    });
                });
            }
            else {
                if (callback)
                    callback(null, doc);
                else
                    return doc;
            }
        }
        catch (err) {
            if (callback)
                callback(err);
            else
                throw err;
        }
    }
    updateMany(conditions, doc = {}, callback) {
        try {
            let filterFileds = functions_1.getConditions(conditions);
            if (filterFileds.trim() !== "" && Object.keys(doc).length > 0) {
                let query;
                const updateNext = () => {
                    query = `${new Query_1.Query(this).update(doc)} ${filterFileds}`;
                };
                if (this.schema.methods.update)
                    this.schema.methods.update(doc, updateNext);
                else
                    updateNext();
                return this.checkDb(() => {
                    return mysql_1.default.execute(query, this.db.db)
                        .then(() => {
                        if (callback)
                            callback(null, doc);
                        else
                            return doc;
                    })
                        .catch((err) => {
                        throw err;
                    });
                });
            }
            else {
                if (callback)
                    callback(null, doc);
                else
                    return doc;
            }
        }
        catch (err) {
            if (callback)
                callback(err);
            else
                throw err;
        }
    }
    deleteOne(conditions, callback) {
        try {
            let query = `DELETE FROM ${this.modelName} ${functions_1.getConditions(conditions)} LIMIT 1`;
            return this.checkDb(() => {
                return mysql_1.default.execute(query, this.db.db)
                    .then(() => {
                    if (callback)
                        callback(null);
                    else
                        return undefined;
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
    deleteMany(conditions, callback) {
        try {
            let filterFileds = functions_1.getConditions(conditions);
            if (filterFileds.trim() !== "") {
                let query = `DELETE FROM ${this.modelName} ${filterFileds}`;
                return this.checkDb(() => {
                    return mysql_1.default.execute(query, this.db.db)
                        .then(() => {
                        if (callback)
                            callback(null);
                        else
                            return undefined;
                    })
                        .catch((err) => {
                        throw err;
                    });
                });
            }
            else {
                if (callback)
                    callback(null);
                else
                    return undefined;
            }
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
            let query = `SELECT COUNT(*) FROM ${this.modelName} ${functions_1.getConditions(conditions)}`;
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
