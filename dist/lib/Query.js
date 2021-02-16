"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = exports.DocumentQuery = void 0;
const mysql_1 = __importDefault(require("./mysql"));
const Document_1 = __importDefault(require("./Document"));
const functions_1 = require("./plugins/functions");
class DocumentQuery {
    constructor(query, model, isOne) {
        this.mainQuery = "";
        this.skipQuery = "";
        this.sortQuery = "";
        this.limitQuery = "";
        this.mainQuery = query;
        this.isOne = isOne ? isOne : false;
        this.model = model;
    }
    limit(val) {
        if (val) {
            this.limitQuery = " LIMIT " + val;
        }
        return this;
    }
    skip(val) {
        if (val) {
            this.skipQuery = " OFFSET " + val;
        }
        return this;
    }
    sort(arg) {
        if (Object.keys(arg).length > 0) {
            let query = " ORDER BY ";
            Object.keys(arg).forEach((key, i) => {
                query += `${key} ${arg[key] === -1 ? 'DESC' : 'ASC'}${i !== Object.keys(arg).length - 1 ? ', ' : ''}`;
            });
            this.sortQuery = query;
        }
        return this;
    }
    exec(callback) {
        let { mainQuery, limitQuery, sortQuery, skipQuery } = this;
        try {
            let query = mainQuery + sortQuery + limitQuery + (limitQuery.trim() !== '' ? skipQuery : '');
            return this.checkDb(() => {
                return mysql_1.default.execute(query, this.model.db.db)
                    .then(([rows]) => {
                    rows = rows.map((row) => {
                        return new Document_1.default(Object.assign({ doc: row }, this.model));
                    });
                    let res;
                    if (!this.isOne)
                        res = rows;
                    else
                        res = rows[0] ? rows[0] : null;
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
        catch (err) {
            if (callback)
                callback(err);
            else
                throw err;
        }
    }
    checkDb(next) {
        return mysql_1.default.execute(`CREATE TABLE IF NOT EXISTS ${this.model.modelName} (${this.model.schema.query})`)
            .then(() => {
            return next();
        })
            .catch((err) => {
            throw err;
        });
    }
}
exports.DocumentQuery = DocumentQuery;
class Query {
    constructor(model) {
        this.model = model;
    }
    update(doc) {
        let query = `UPDATE ${this.model.modelName} SET `;
        Object.keys(doc).forEach((key) => {
            let value = functions_1.withOptions(doc[key], this.model.schema.obj[key]);
            doc[key] = value;
            value = mysql_1.default.escape(functions_1.withOptions(value, this.model.schema.obj[key]));
            query += `${key} = ${value}, `;
        });
        if (this.model.schema.options.timestamps)
            query += `_updatedAt = ${mysql_1.default.escape(new Date())}, `;
        if (query.slice(-2) === ', ')
            query = query.slice(0, -2);
        return query;
    }
}
exports.Query = Query;
