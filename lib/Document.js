"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _schema, _db, _modelName, _isNew;
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("./mysql"));
const ObjectId_1 = __importDefault(require("./plugins/ObjectId"));
const functions_1 = require("./plugins/functions");
class Document {
    constructor(params) {
        _schema.set(this, void 0);
        _db.set(this, void 0);
        _modelName.set(this, void 0);
        _isNew.set(this, void 0);
        __classPrivateFieldSet(this, _schema, params.schema);
        __classPrivateFieldSet(this, _modelName, params.modelName);
        __classPrivateFieldSet(this, _db, params.db);
        __classPrivateFieldSet(this, _isNew, params.isNew || false);
        this.convertData({ doc: params.doc });
    }
    get schema() {
        return __classPrivateFieldGet(this, _schema);
    }
    get modelName() {
        return __classPrivateFieldGet(this, _modelName);
    }
    get isNew() {
        return __classPrivateFieldGet(this, _isNew);
    }
    save(callback) {
        try {
            let query = this.isNew ? `INSERT INTO ${this.table_name ? this.table_name : this.modelName}` : `UPDATE ${this.table_name ? this.table_name : this.modelName} SET`;
            const saveNext = () => {
                let cols = "", values = "", updateString = "";
                for (let key in __classPrivateFieldGet(this, _schema).obj) {
                    let value = this[key];
                    if (!this.isNew && Boolean(__classPrivateFieldGet(this, _schema).options) && __classPrivateFieldGet(this, _schema).options.timestamps && key === '_updatedAt')
                        value = new Date();
                    if (typeof value !== 'undefined') {
                        value = mysql_1.default.escape(functions_1.withOptions(value, __classPrivateFieldGet(this, _schema).obj[key]));
                        if (this.isNew) {
                            cols += `${key}, `;
                            values += `${value}, `;
                        }
                        else {
                            updateString += `${key} = ${value}, `;
                        }
                    }
                }
                ;
                if (this.isNew) {
                    if (cols.slice(-2) === ', ')
                        cols = cols.slice(0, -2);
                    if (values.slice(-2) === ', ')
                        values = values.slice(0, -2);
                    query += ` (${cols}) VALUES (${values})`;
                }
                else {
                    if (updateString.slice(-2) === ', ')
                        updateString = updateString.slice(0, -2);
                    query += ` ${updateString} WHERE _id = ${mysql_1.default.escape(this['_id'])}`;
                }
            };
            if (__classPrivateFieldGet(this, _schema).preMethods.save)
                __classPrivateFieldGet(this, _schema).preMethods.save.call(this, saveNext);
            else
                saveNext();
            return mysql_1.default.execute(query, __classPrivateFieldGet(this, _db).db)
                .then(() => {
                if (this.isNew)
                    __classPrivateFieldSet(this, _isNew, false);
                if (callback)
                    callback(null, this);
                else
                    return this;
            })
                .catch((err) => {
                if (callback) {
                    callback(err);
                }
                else
                    throw err;
            });
        }
        catch (err) {
            if (callback) {
                callback(err);
            }
            else
                throw err;
        }
    }
    update(doc = {}, callback) {
        try {
            let keys = Object.keys(doc);
            if (keys.length > 0) {
                let query = `UPDATE ${this.table_name ? this.table_name : this.modelName} SET `;
                const updateNext = () => {
                    keys.forEach((key) => {
                        let options = __classPrivateFieldGet(this, _schema).obj[key];
                        if (options) {
                            let value = functions_1.withOptions(doc[key], options);
                            this[key] = value;
                            value = mysql_1.default.escape(value);
                            query += `${key} = ${value}, `;
                        }
                    });
                    if (Boolean(__classPrivateFieldGet(this, _schema).options) && __classPrivateFieldGet(this, _schema).options.timestamps)
                        query += `_updatedAt = ${mysql_1.default.escape(new Date())}, `;
                    if (query.slice(-2) === ', ')
                        query = query.slice(0, -2);
                    query += ` WHERE _id = ${mysql_1.default.escape(this['_id'])}`;
                };
                if (__classPrivateFieldGet(this, _schema).preMethods.update)
                    __classPrivateFieldGet(this, _schema).preMethods.update.call(this, updateNext);
                else
                    updateNext();
                return mysql_1.default.execute(query, __classPrivateFieldGet(this, _db).db)
                    .then(() => {
                    if (callback)
                        callback(null, this);
                    else
                        return this;
                })
                    .catch((err) => {
                    throw err;
                });
            }
            else {
                if (callback)
                    callback(null, this);
                else
                    return this;
            }
        }
        catch (err) {
            if (callback) {
                callback(err);
            }
            else
                throw err;
        }
    }
    remove(callback) {
        try {
            if (this['_id']) {
                let query = `DELETE FROM ${this.modelName} WHERE _id = ${mysql_1.default.escape(this['_id'])}`;
                const removeNext = () => {
                };
                if (__classPrivateFieldGet(this, _schema).preMethods.remove)
                    __classPrivateFieldGet(this, _schema).preMethods.remove.call(this, removeNext);
                else
                    removeNext();
                return mysql_1.default.execute(query, __classPrivateFieldGet(this, _db).db)
                    .then(() => {
                    if (callback)
                        callback(null, this);
                    else
                        return this;
                })
                    .catch((err) => {
                    throw err;
                });
            }
            else
                throw "ID isn't filled.";
        }
        catch (err) {
            if (callback) {
                callback(err);
            }
            else
                throw err;
        }
    }
    convertData({ doc }) {
        const hasId = __classPrivateFieldGet(this, _schema).options === undefined || __classPrivateFieldGet(this, _schema).options._id === undefined || __classPrivateFieldGet(this, _schema).options._id;
        for (let key in __classPrivateFieldGet(this, _schema).obj) {
            if (this.isNew) {
                let defaultValue = undefined, value = null;
                if (typeof __classPrivateFieldGet(this, _schema).obj[key] !== 'string') {
                    defaultValue = __classPrivateFieldGet(this, _schema).obj[key].default;
                    if (typeof defaultValue === 'function')
                        defaultValue = defaultValue();
                }
                if (doc[key])
                    value = functions_1.withOptions(doc[key], __classPrivateFieldGet(this, _schema).obj[key]);
                else if (defaultValue)
                    value = functions_1.withOptions(defaultValue, __classPrivateFieldGet(this, _schema).obj[key]);
                if (hasId && key === '_id' && __classPrivateFieldGet(this, _schema).options.objectId)
                    value = ObjectId_1.default();
                if (value)
                    this[key] = value;
            }
            else if (typeof doc[key] !== 'undefined') {
                this[key] = doc[key];
            }
        }
        if (!this.isNew && doc.table_name)
            this.table_name = doc.table_name;
    }
}
_schema = new WeakMap(), _db = new WeakMap(), _modelName = new WeakMap(), _isNew = new WeakMap();
exports.default = Document;
