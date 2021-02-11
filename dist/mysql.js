"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const Connection_1 = __importDefault(require("./Connection"));
var Singleton = (function () {
    var connection, connections = [];
    return {
        connection: function () {
            return connection;
        },
        connections: function () {
            return connections;
        },
        connect: function (props) {
            try {
                connection = new Connection_1.default(promise_1.default.createPool(props), props.database);
                connections.push(connection);
                return connection;
            }
            catch (err) {
                throw err;
            }
        },
        createConnection: function (props) {
            try {
                let _connection = new Connection_1.default(promise_1.default.createPool(props), props.database);
                connections.push(_connection);
                return _connection;
            }
            catch (err) {
                throw err;
            }
        },
        escape: (value) => promise_1.default.escape(value),
        format: (sql, values) => promise_1.default.format(sql, values)
    };
})();
exports.default = Singleton;
