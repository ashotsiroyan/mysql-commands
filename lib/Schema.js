"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataTypes_1 = require("./plugins/dataTypes");
class Schema {
    constructor(definition, options) {
        var _a;
        this.indexes = {};
        this.preMethods = {};
        this.obj = definition;
        this.options = options;
        if (this.obj.table_name)
            throw "'table_name' can't be used";
        const hasId = this.options === undefined || this.options._id === undefined || this.options._id;
        if (hasId) {
            if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.objectId)
                this.obj = Object.assign({ _id: { type: 'VARCHAR', size: 24, primaryKey: true } }, this.obj);
            else
                this.obj = Object.assign({ _id: { type: 'INT', primaryKey: true, autoinc: true } }, this.obj);
        }
        if (Boolean(this.options) && this.options.timestamps)
            this.obj = Object.assign(Object.assign({}, this.obj), { _createdAt: { type: 'DATETIME', default: () => new Date() }, _updatedAt: { type: 'DATETIME', default: () => new Date() } });
    }
    // public methods: SchemaMethods = {};
    get query() {
        return this.convertToString();
    }
    pre(method, callBack) {
        this.preMethods[method] = callBack;
    }
    remove(field) {
        delete this.obj[field];
    }
    index(fields) {
        const exists = (name) => {
            let is = false;
            for (let key in this.indexes) {
                if (name === key) {
                    is = true;
                    return true;
                }
            }
            return is;
        };
        for (let key in fields) {
            if (this.obj[key] !== undefined) {
                if (!exists(fields[key])) {
                    this.indexes[fields[key]] = [key];
                }
                else {
                    this.indexes[fields[key]].push(key);
                }
            }
        }
    }
    convertToString() {
        let fileds = Object.keys(this.obj), columns = [], indexes = [], foreignKeys = [];
        fileds.forEach((field, i) => {
            let option = this.obj[field], mysql = `${field} `;
            if (typeof option !== 'string') {
                let size = "";
                if (option.size) {
                    if (dataTypes_1.dataTypesOptions[option.type].min !== null && option.size > dataTypes_1.dataTypesOptions[option.type].min)
                        size = `(${option.size})`;
                    else if (dataTypes_1.dataTypesOptions[option.type].min)
                        size = `(${dataTypes_1.dataTypesOptions[option.type].min})`;
                    if (dataTypes_1.dataTypesOptions[option.type].max !== null && option.size < dataTypes_1.dataTypesOptions[option.type].max)
                        size = `(${option.size})`;
                    else if (dataTypes_1.dataTypesOptions[option.type].max)
                        size = `(${dataTypes_1.dataTypesOptions[option.type].max})`;
                }
                else if (dataTypes_1.dataTypesOptions[option.type].default) {
                    size = `(${dataTypes_1.dataTypesOptions[option.type].default})`;
                }
                mysql += `${option.type}${size} `;
                if (option.null === undefined)
                    option.null = false;
                Object.keys(option).forEach((key, j) => {
                    option = option;
                    if (key === 'null')
                        mysql += `${!option[key] ? "NOT " : ""}NULL`;
                    else if (key === 'foreignKey' && option['foreignKey'] !== undefined) {
                        foreignKeys.push(`(${field}) REFERENCES ${option['foreignKey'].modelName}(${option['foreignKey'].field})`);
                    }
                    else if (key === 'ref' && option['ref']) {
                        foreignKeys.push(`(${field}) REFERENCES ${option['ref']}(_id)`);
                    }
                    else if (option[key])
                        switch (key) {
                            case 'primaryKey':
                                mysql += 'PRIMARY KEY';
                                break;
                            case 'unsigned':
                                mysql += 'UNSIGNED';
                                break;
                            case 'unique':
                                mysql += 'UNIQUE KEY';
                                break;
                            case 'autoinc':
                                mysql += 'AUTO_INCREMENT';
                                break;
                        }
                    if (key !== 'size' && key !== 'type' && j !== Object.keys(option).length - 1)
                        mysql += " ";
                });
            }
            else {
                mysql += `${option}${dataTypes_1.dataTypesOptions[option].default ? "(" + dataTypes_1.dataTypesOptions[option].default + ")" : ""} NOT NULL`;
            }
            columns.push(mysql);
        });
        for (let index in this.indexes) {
            indexes.push(`${index} (${this.indexes[index].join(', ')})`);
        }
        return {
            columns,
            indexes,
            fileds,
            foreignKeys
        };
    }
}
exports.default = Schema;
