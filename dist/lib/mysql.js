"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
var Singleton = (function () {
    var instance;
    return {
        pool: {
            execute: (sql, values) => { if (instance)
                return instance.execute(sql, values);
            else
                throw "Isn't connected to database."; },
            query: (sql, values) => { if (instance)
                return instance.query(sql, values);
            else
                throw "Isn't connected to database."; },
            escape: (value) => promise_1.default.escape(value),
            format: (sql, values) => promise_1.default.format(sql, values)
        },
        connect: function (props) {
            try {
                instance = promise_1.default.createPool(props);
                return true;
            }
            catch (err) {
                throw err;
            }
        }
    };
})();
exports.default = Singleton;
