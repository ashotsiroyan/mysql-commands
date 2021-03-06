"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        const query = new Query_1.DocumentQuery(conditions, fields, this);
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
        const query = (new Query_1.DocumentQuery(conditions, fields, this, true)).limit(1);
        if (callback)
            query.exec(callback);
        return query;
    }
    findById(id, fields, callback) {
        if (typeof fields === 'function') {
            callback = fields;
            fields = null;
        }
        const query = (new Query_1.DocumentQuery({ _id: id }, fields, this, true)).limit(1);
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
            if (this.schema.preMethods.insertMany) {
                this.schema.preMethods.insertMany.call(docs, insertNext);
            }
            else
                insertNext();
            return mysql_1.default.execute(query, this.db.db)
                .then(() => {
                if (callback)
                    callback(null, docs);
                else
                    return docs;
            })
                .catch((err) => {
                if (callback)
                    callback(err);
                else
                    throw err;
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
                let query = '';
                const updateNext = () => {
                    query = `${new Query_1.Query(this).update(doc)} ${functions_1.getConditions(conditions)} LIMIT 1`;
                };
                if (this.schema.preMethods.update)
                    this.schema.preMethods.update.call(doc, updateNext);
                else
                    updateNext();
                return mysql_1.default.execute(query, this.db.db)
                    .then(() => {
                    if (callback)
                        callback(null, doc);
                    else
                        return doc;
                })
                    .catch((err) => {
                    if (callback)
                        callback(err);
                    else
                        throw err;
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
                let query = '';
                const updateNext = () => {
                    query = `${new Query_1.Query(this).update(doc)} ${filterFileds}`;
                };
                if (this.schema.preMethods.update)
                    this.schema.preMethods.update.call(doc, updateNext);
                else
                    updateNext();
                return mysql_1.default.execute(query, this.db.db)
                    .then(() => {
                    if (callback)
                        callback(null, doc);
                    else
                        return doc;
                })
                    .catch((err) => {
                    if (callback)
                        callback(err);
                    else
                        throw err;
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
            return mysql_1.default.execute(query, this.db.db)
                .then(() => {
                if (callback)
                    callback(null);
                else
                    return undefined;
            })
                .catch((err) => {
                if (callback)
                    callback(err);
                else
                    throw err;
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
                return mysql_1.default.execute(query, this.db.db)
                    .then(() => {
                    if (callback)
                        callback(null);
                    else
                        return undefined;
                })
                    .catch((err) => {
                    if (callback)
                        callback(err);
                    else
                        throw err;
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
    findOneAndUpdate(conditions, update, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let doc = yield this.findOne(conditions).exec();
                if (doc && Object.keys(update).length > 0) {
                    let query = '';
                    const updateNext = () => {
                        Object.keys(update).forEach((key) => {
                            if (this.schema.obj[key]) {
                                doc[key] = update[key];
                            }
                        });
                        query = `${new Query_1.Query(this).update(update)} ${functions_1.getConditions(conditions)} LIMIT 1`;
                    };
                    if (this.schema.preMethods.findOneAndUpdate)
                        this.schema.preMethods.findOneAndUpdate.call(update, updateNext);
                    else
                        updateNext();
                    return mysql_1.default.execute(query, this.db.db)
                        .then(() => {
                        if (callback)
                            callback(null, doc);
                        else
                            return doc;
                    })
                        .catch((err) => {
                        if (callback)
                            callback(err, null);
                        else
                            throw err;
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
                    callback(err, null);
                else
                    throw err;
            }
        });
    }
    findByIdAndUpdate(id, update, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (callback) {
                    this.findOneAndUpdate({ _id: id }, update, callback);
                }
                else {
                    return yield this.findOneAndUpdate({ _id: id }, update);
                }
            }
            catch (err) {
                if (callback)
                    callback(err, null);
                else
                    throw err;
            }
        });
    }
    findOneAndDelete(conditions, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let doc = yield this.findOne(conditions).exec();
                if (doc) {
                    let query = `DELETE FROM ${this.modelName}`;
                    const deleteNext = () => {
                        query += ` ${functions_1.getConditions(conditions)} LIMIT 1`;
                    };
                    if (this.schema.preMethods.findOneAndDelete)
                        this.schema.preMethods.findOneAndDelete.call(doc, deleteNext);
                    else
                        deleteNext();
                    return mysql_1.default.execute(query, this.db.db)
                        .then(() => {
                        if (callback)
                            callback(null, doc);
                        else
                            return doc;
                    })
                        .catch((err) => {
                        if (callback)
                            callback(err, null);
                        else
                            throw err;
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
                    callback(err, null);
                else
                    throw err;
            }
        });
    }
    findByIdAndDelete(id, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (callback) {
                    this.findOneAndDelete({ _id: id }, callback);
                }
                else {
                    return yield this.findOneAndDelete({ _id: id });
                }
            }
            catch (err) {
                if (callback)
                    callback(err, null);
                else
                    throw err;
            }
        });
    }
    countDocuments(conditions, callback) {
        try {
            let query = `SELECT COUNT(*) FROM ${this.modelName} ${functions_1.getConditions(conditions)}`;
            return mysql_1.default.execute(query, this.db.db).then(([res]) => {
                let count = res[0]['COUNT(*)'];
                if (callback)
                    callback(null, count);
                else
                    return count;
            })
                .catch((err) => {
                if (callback)
                    callback(err);
                else
                    throw err;
            });
        }
        catch (err) {
            if (callback)
                callback(err);
            else
                throw err;
        }
    }
}
exports.default = Model;
