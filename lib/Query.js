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
    constructor(conditions, fields, model, isOne) {
        this.conditions = {};
        this.fields = [];
        this.skipQuery = "";
        this.sortQuery = "";
        this.limitQuery = "";
        this.unionModels = [];
        this.conditions = conditions;
        this.fields = fields;
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
        let keys = Object.keys(arg);
        if (keys.length > 0) {
            let query = " ORDER BY ";
            keys.forEach((key, i) => {
                query += `${key} ${arg[key] === -1 ? 'DESC' : 'ASC'}${i !== keys.length - 1 ? ', ' : ''}`;
            });
            this.sortQuery = query;
        }
        return this;
    }
    union(model, all) {
        if (Array.isArray(model)) {
            for (let i = 0; i < model.length; ++i) {
                this.unionModels.push({
                    model: model[i],
                    isAll: all ? true : false
                });
            }
            this.unionModels.concat();
        }
        else {
            this.unionModels.push({
                model: model,
                isAll: all ? true : false
            });
        }
        return this;
    }
    exec(callback) {
        try {
            let { conditions, fields, limitQuery, sortQuery, skipQuery, unionModels } = this;
            let _conditions = functions_1.getConditions(conditions), _fields = functions_1.getFileds(fields);
            let query = `SELECT ${unionModels.length > 0 ? `'${this.model.modelName}' as table_name${_fields !== '*' ? ', ' + _fields : ''}` : _fields} FROM ${this.model.modelName} ${_conditions}`;
            unionModels.forEach((el) => {
                query += ` UNION${el.isAll ? ' ALL' : ''} SELECT '${el.model.modelName}' as table_name${_fields !== '*' ? ', ' + _fields : ''} FROM ${el.model.modelName} ${_conditions}`;
            });
            query += sortQuery + limitQuery + (limitQuery.trim() !== '' ? skipQuery : '');
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
exports.DocumentQuery = DocumentQuery;
class Query {
    constructor(model) {
        this.model = model;
    }
    update(doc) {
        let query = `UPDATE ${this.model.modelName} SET `;
        for (let key in doc) {
            let options = this.model.schema.obj[key];
            if (options) {
                let value = functions_1.withOptions(doc[key], options);
                doc[key] = value;
                value = mysql_1.default.escape(functions_1.withOptions(value, options));
                query += `${key} = ${value}, `;
            }
        }
        ;
        if (Boolean(this.model.schema.options) && this.model.schema.options.timestamps)
            query += `_updatedAt = ${mysql_1.default.escape(new Date())}, `;
        if (query.slice(-2) === ', ')
            query = query.slice(0, -2);
        return query;
    }
}
exports.Query = Query;
