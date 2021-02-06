"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataTypes_1 = require("./plugins/dataTypes");
class Schema {
    constructor(definition, options = {}) {
        this.mysql = "";
        this.definition = definition;
        this.options = options;
        this.methods = {};
        this.convertToString();
    }
    getParams() {
        return {
            sqlString: this.mysql,
            definition: this.definition,
            methods: this.methods,
            options: this.options
        };
    }
    pre(method, callBack) {
        this.methods[method] = callBack;
    }
    index(fields = {}) {
        let indexes = {}, sqlString = "";
        const exists = (name) => {
            let is = false;
            Object.keys(indexes).forEach((key) => {
                if (name === key) {
                    is = true;
                    return true;
                }
            });
            return is;
        };
        Object.keys(fields).forEach((key) => {
            if (this.definition[key] !== undefined) {
                if (!exists(fields[key])) {
                    indexes[fields[key]] = [key];
                }
                else {
                    indexes[fields[key]].push(key);
                }
            }
        });
        Object.keys(indexes).forEach((index, i) => {
            sqlString += `INDEX ${index} (`;
            indexes[index].forEach((field, j) => {
                sqlString += `${field}${j !== indexes[index].length - 1 ? ', ' : ''}`;
            });
            sqlString += `)${i !== Object.keys(indexes).length - 1 ? ', ' : ''}`;
        });
        this.mysql += ', ' + sqlString;
    }
    convertToString() {
        const hasId = this.options._id === undefined || this.options._id ? true : false;
        if (hasId)
            this.definition = Object.assign({ _id: { type: 'VARCHAR', size: 24, primaryKey: true } }, this.definition);
        if (this.options.timestamps)
            this.definition = Object.assign(Object.assign({}, this.definition), { _createdAt: { type: 'DATE', default: new Date() }, _updatedAt: { type: 'DATE', default: new Date() } });
        Object.keys(this.definition).forEach((field, i) => {
            let option = this.definition[field];
            this.mysql += `${field} `;
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
                this.mysql += `${option.type}${size} `;
                if (option.null === undefined)
                    option.null = false;
                Object.keys(option).forEach((key, j) => {
                    option = option;
                    if (key === 'null')
                        this.mysql += `${!option[key] ? "NOT " : ""}NULL`;
                    else if (key === 'autoinc' && option[key])
                        this.mysql += `AUTO_INCREMENT ${!hasId ? 'PRIMARY' : 'UNIQUE'} KEY`;
                    else if ((key === 'primaryKey' || key === 'unsigned' || key === 'unique') && option[key])
                        this.mysql += `${key === 'primaryKey' ? 'PRIMARY KEY' : key === 'unsigned' ? 'UNSIGNED' : 'UNIQUE KEY'}`;
                    if (key !== 'size' && key !== 'type' && j !== Object.keys(option).length - 1)
                        this.mysql += " ";
                });
            }
            else {
                this.mysql += `${option}${dataTypes_1.dataTypesOptions[option].default ? "(" + dataTypes_1.dataTypesOptions[option].default + ")" : ""} NOT NULL`;
            }
            if (i !== Object.keys(this.definition).length - 1)
                this.mysql += ", ";
        });
    }
}
exports.default = Schema;