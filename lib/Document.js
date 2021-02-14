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
var _schema, _db, _table, _isNew;
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("./mysql"));
const ObjectId_1 = __importDefault(require("./plugins/ObjectId"));
class Document {
    constructor(params) {
        _schema.set(this, void 0);
        _db.set(this, void 0);
        _table.set(this, void 0);
        _isNew.set(this, void 0);
        __classPrivateFieldSet(this, _schema, params.schema);
        __classPrivateFieldSet(this, _table, params.table);
        __classPrivateFieldSet(this, _db, params.db);
        __classPrivateFieldSet(this, _isNew, params.isNew || false);
        this.convertData({ doc: params.doc });
    }
    get schema() {
        return __classPrivateFieldGet(this, _schema);
    }
    get tableName() {
        return __classPrivateFieldGet(this, _table);
    }
    get isNew() {
        return __classPrivateFieldGet(this, _isNew);
    }
    save(callback) {
        try {
            let query = this.isNew ? "INSERT INTO " + this.tableName : `UPDATE ${this.tableName} SET`;
            const saveNext = () => {
                let keys = Object.keys(__classPrivateFieldGet(this, _schema).obj), cols = "", values = "", updateString = "";
                keys.forEach((key) => {
                    let value = this[key];
                    if (!this.isNew && __classPrivateFieldGet(this, _schema).options.timestamps && key === '_updatedAt')
                        value = new Date();
                    value = mysql_1.default.escape(value);
                    if (this.isNew) {
                        cols += `${key}, `;
                        values += `${value}, `;
                    }
                    else if (key !== '_id' && key !== 'id') {
                        updateString += `${key} = ${value}, `;
                    }
                });
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
            if (__classPrivateFieldGet(this, _schema).methods.save)
                __classPrivateFieldGet(this, _schema).methods.save(this, saveNext);
            else
                saveNext();
            return this.checkDb(() => {
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
    remove(callback) {
        try {
            if (this['_id']) {
                let query = `DELETE FROM ${this.tableName} WHERE _id = ${mysql_1.default.escape(this['_id'])}`;
                const removeNext = () => {
                };
                if (__classPrivateFieldGet(this, _schema).methods.remove)
                    __classPrivateFieldGet(this, _schema).methods.remove(this, removeNext);
                else
                    removeNext();
                return this.checkDb(() => {
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
        const hasId = __classPrivateFieldGet(this, _schema).options._id === undefined || __classPrivateFieldGet(this, _schema).options._id ? true : false;
        let keys = Object.keys(__classPrivateFieldGet(this, _schema).obj);
        keys.forEach((key) => {
            if (this.isNew) {
                let defaultValue = undefined, value = '';
                if (typeof __classPrivateFieldGet(this, _schema).obj[key] !== 'string') {
                    defaultValue = __classPrivateFieldGet(this, _schema).obj[key].default;
                }
                if (doc[key])
                    value = doc[key];
                else if (defaultValue)
                    value = defaultValue;
                if (typeof __classPrivateFieldGet(this, _schema).obj[key] !== 'string') {
                    let def = __classPrivateFieldGet(this, _schema).obj[key];
                    if (def.lowercase)
                        value = value.toLowerCase();
                    if (def.uppercase)
                        value = value.toUpperCase();
                    if (def.trim)
                        value = value.trim();
                }
                if (hasId && key === '_id')
                    value = ObjectId_1.default();
                this[key] = value;
            }
            else if (doc[key]) {
                this[key] = doc[key];
            }
        });
    }
    checkDb(next) {
        return mysql_1.default.execute(`CREATE TABLE IF NOT EXISTS ${this.tableName} (${this.schema.query})`)
            .then(() => {
            return next();
        })
            .catch((err) => {
            throw err;
        });
    }
}
_schema = new WeakMap(), _db = new WeakMap(), _table = new WeakMap(), _isNew = new WeakMap();
exports.default = Document;
