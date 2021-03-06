"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinWithFields = exports.withOptions = exports.getFileds = exports.getConditions = void 0;
const mysql_1 = __importDefault(require("../mysql"));
const selectorActions = {
    $lt: '<',
    $gt: '>',
    $lte: '<=',
    $gte: '>=',
    $eq: '=',
    $ne: '!=',
    $in: 'LIKE',
    $nin: 'NOT LIKE'
};
function getConditions(arg) {
    let filterFileds = "";
    const closer = ({ params, prevField = null }) => {
        if (params) {
            let fields = Object.keys(params);
            fields.forEach((field, i) => {
                if (typeof params[field] === 'object') {
                    if (field === '$or' || field === '$and') {
                        params[field].forEach((option, j) => {
                            filterFileds += "(";
                            closer({ params: option });
                            if (filterFileds.slice(-5) === ' AND ')
                                filterFileds = filterFileds.slice(0, -5);
                            filterFileds += `)${j !== params[field].length - 1 ? ` ${field === '$or' ? "OR" : "AND"} ` : ""}`;
                        });
                    }
                    else {
                        if (!Array.isArray(params[field])) {
                            closer({ params: params[field], prevField: field });
                        }
                        else if (field === '$in' || field === '$nin') {
                            params[field].forEach((value) => {
                                filterFileds += `${prevField} ${selectorActions[field]} ${mysql_1.default.escape(value)} ${field === '$nin' ? 'AND' : 'OR'} `;
                            });
                        }
                    }
                }
                else {
                    let value = params[field];
                    if (field[0] === '$') {
                        filterFileds += `${prevField} ${selectorActions[field]} ${mysql_1.default.escape(value)}${i !== fields.length - 1 ? ' AND ' : ''}`;
                    }
                    else {
                        filterFileds += `${field} = ${mysql_1.default.escape(value)}${i !== fields.length - 1 ? ' AND ' : ''}`;
                    }
                }
            });
        }
    };
    closer({ params: arg });
    if (filterFileds.slice(-5) === ' AND ')
        filterFileds = filterFileds.slice(0, -5);
    if (filterFileds.slice(-4) === ' OR ')
        filterFileds = filterFileds.slice(0, -4);
    if (filterFileds.trim() !== "")
        filterFileds = "WHERE " + filterFileds;
    return filterFileds;
}
exports.getConditions = getConditions;
function getFileds(arg) {
    let showFileds = arg && arg.length > 0 ? "" : "*";
    if (arg && arg.length > 0)
        arg.forEach((field, i) => {
            showFileds += `${field}${i !== arg.length - 1 ? ', ' : ''}`;
        });
    return showFileds;
}
exports.getFileds = getFileds;
function withOptions(value, options) {
    if (typeof value === 'string' && typeof options !== 'string') {
        let def = options;
        if (def.lowercase)
            value = value.toLowerCase();
        if (def.uppercase)
            value = value.toUpperCase();
        if (def.trim)
            value = value.trim();
    }
    return value;
}
exports.withOptions = withOptions;
function joinWithFields(separator, array, fields) {
    let string = '';
    array.forEach((el, i) => {
        string += el;
        if (i === 0)
            string += ' FIRST';
        else
            string += ' AFTER ' + fields[i - 1];
        if (i !== array.length - 1)
            string += separator;
    });
    return string;
}
exports.joinWithFields = joinWithFields;
