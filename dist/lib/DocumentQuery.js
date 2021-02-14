"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("./mysql"));
const Document_1 = __importDefault(require("./Document"));
class DocumentQuery {
    constructor(query, docProps, fnName) {
        this.mainQuery = "";
        this.skipQuery = "";
        this.sortQuery = "";
        this.limitQuery = "";
        this.mainQuery = query;
        this.docProps = docProps;
        this.fnName = fnName;
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
                return mysql_1.default.execute(query, this.docProps.db.db)
                    .then(([rows]) => {
                    mainQuery = "";
                    limitQuery = "";
                    sortQuery = "";
                    skipQuery = "";
                    rows = rows.map((row) => {
                        return new Document_1.default(Object.assign({ doc: row }, this.docProps));
                    });
                    let res;
                    if (this.fnName === 'find')
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
            mainQuery = "";
            limitQuery = "";
            sortQuery = "";
            skipQuery = "";
            if (callback)
                callback(err);
            else
                throw err;
        }
    }
    checkDb(next) {
        return mysql_1.default.execute(`CREATE TABLE IF NOT EXISTS ${this.docProps.table} (${this.docProps.schema.query})`)
            .then(() => {
            return next();
        })
            .catch((err) => {
            throw err;
        });
    }
}
exports.default = DocumentQuery;
