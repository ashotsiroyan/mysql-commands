"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataTypesOptions = void 0;
exports.dataTypesOptions = {
    CHAR: {
        min: 0,
        max: 255,
        default: 1
    },
    VARCHAR: {
        min: 0,
        max: 65535,
        default: 32
    },
    BINARY: {
        min: 0,
        max: null,
        default: 1
    },
    VARBINARY: {
        min: 0,
        max: null,
        default: null
    },
    TINYBLOB: {
        min: 0,
        max: 255,
        default: null
    },
    TINYTEXT: {
        min: 0,
        max: 255,
        default: null
    },
    TEXT: {
        min: 0,
        max: 65535,
        default: null
    },
    BLOB: {
        min: 0,
        max: 65535,
        default: null
    },
    MEDIUMTEXT: {
        min: 0,
        max: 16777215,
        default: null
    },
    LONGTEXT: {
        min: 0,
        max: 4294967295,
        default: null
    },
    LONGBLOB: {
        min: 0,
        max: 4294967295,
        default: null
    },
    ENUM: {
        min: 0,
        max: 65535,
        default: 3
    },
    SET: {
        min: 0,
        max: 64,
        default: 1
    },
    BIT: {
        min: 1,
        max: 64,
        default: 1
    },
    TINYINT: {
        min: 1,
        max: 255,
        default: null
    },
    BOOL: {
        min: null,
        max: null,
        default: null
    },
    BOOLEAN: {
        min: null,
        max: null,
        default: null
    },
    SMALLINT: {
        min: 1,
        max: 255,
        default: null
    },
    MEDIUMINT: {
        min: 1,
        max: 255,
        default: null
    },
    INT: {
        min: 1,
        max: 255,
        default: null
    },
    INTEGER: {
        min: 1,
        max: 255,
        default: null
    },
    BIGINT: {
        min: 1,
        max: 255,
        default: null
    },
    FLOAT: {
        min: 0,
        max: 24,
        default: null
    },
    DOUBLE: {
        min: null,
        max: null,
        default: null
    },
    DATE: {
        min: null,
        max: null,
        default: null
    },
    DATETIME: {
        min: null,
        max: null,
        default: null
    },
    TIMESTAMP: {
        min: null,
        max: null,
        default: null
    },
    TIME: {
        min: null,
        max: null,
        default: null
    },
    YEAR: {
        min: 4,
        max: 4,
        default: 4
    },
};
