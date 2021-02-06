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
var _preSave, _checkDb, _schema, _table, _options, _isNew;
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("./mysql"));
const ObjectId_1 = __importDefault(require("./plugins/ObjectId"));
const pool = mysql_1.default.pool;
class Document {
    constructor(params) {
        _preSave.set(this, void 0);
        _checkDb.set(this, void 0);
        _schema.set(this, void 0);
        _table.set(this, void 0);
        _options.set(this, void 0);
        _isNew.set(this, void 0);
        __classPrivateFieldSet(this, _preSave, params.preSave);
        __classPrivateFieldSet(this, _checkDb, params.checkDb);
        __classPrivateFieldSet(this, _schema, params.schema);
        __classPrivateFieldSet(this, _options, params.options);
        __classPrivateFieldSet(this, _table, params.table);
        __classPrivateFieldSet(this, _isNew, params.isNew || false);
        this.convertData({ doc: params.doc });
    }
    get tableName() {
        return __classPrivateFieldGet(this, _table);
    }
    get isNew() {
        return __classPrivateFieldGet(this, _isNew);
    }
    save(callback) {
        try {
            let query = this.isNew ? "INSERT INTO " + this.tableName : `UPDATE ${this.tableName} SET`, cols = "", values = "", updateString = "";
            const insert = () => {
                let keys = Object.keys(__classPrivateFieldGet(this, _schema));
                keys.forEach((key) => {
                    let value = this[key];
                    if (!this.isNew && __classPrivateFieldGet(this, _options).timestamps && key === '_updatedAt')
                        value = new Date();
                    value = pool.escape(value);
                    if (this.isNew) {
                        cols += `${key}, `;
                        values += `${value}, `;
                    }
                    else if (key !== '_id' && key !== 'id') {
                        updateString += `${key} = ${value}, `;
                    }
                });
                if (this.isNew)
                    query += ` (${cols.slice(0, -2)}) VALUES (${values.slice(0, -2)})`;
                else
                    query += ` ${updateString.slice(0, -2)} WHERE _id = ${pool.escape(this['_id'])}`;
                return __classPrivateFieldGet(this, _checkDb).call(this, () => {
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
            if (__classPrivateFieldGet(this, _preSave))
                __classPrivateFieldGet(this, _preSave).call(this, this, insert);
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
    convertData({ doc }) {
        const hasId = __classPrivateFieldGet(this, _options)._id === undefined || __classPrivateFieldGet(this, _options)._id ? true : false;
        let keys = Object.keys(__classPrivateFieldGet(this, _schema));
        keys.forEach((key) => {
            if (this.isNew) {
                let defaultValue = undefined, value = '';
                if (typeof __classPrivateFieldGet(this, _schema)[key] !== 'string') {
                    defaultValue = __classPrivateFieldGet(this, _schema)[key].default;
                }
                if (doc[key])
                    value = doc[key];
                else if (defaultValue)
                    value = defaultValue;
                if (hasId && key === '_id')
                    value = ObjectId_1.default();
                this[key] = value;
            }
            else if (doc[key]) {
                this[key] = doc[key];
            }
        });
    }
}
_preSave = new WeakMap(), _checkDb = new WeakMap(), _schema = new WeakMap(), _table = new WeakMap(), _options = new WeakMap(), _isNew = new WeakMap();
exports.default = Document;
