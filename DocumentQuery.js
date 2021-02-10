"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("./mysql"));
const Document_1 = __importDefault(require("./Document"));
const pool = mysql_1.default.pool;
class DocumentQuery {
    constructor(query, docProps, fnName) {
        this.mainQuery = "";
        this.skipQuery = "";
        this.sortQuery = "";
        this.limitQuery = "";
        this.mainQuery = query;
        this.checkDb = docProps.checkDb;
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
                return pool.execute(query)
                    .then(([rows]) => {
                    mainQuery = "";
                    limitQuery = "";
                    sortQuery = "";
                    skipQuery = "";
                    let res = rows.map((row) => {
                        return new Document_1.default(Object.assign({ doc: row }, this.docProps));
                    });
                    if (this.fnName === 'findOne' || this.fnName === 'findById')
                        res = res[0];
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
}
exports.default = DocumentQuery;
