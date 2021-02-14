"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const Connection_1 = __importDefault(require("./Connection"));
var Singleton = (function () {
    var connection = new Connection_1.default(), connections = [connection];
    return {
        connection,
        connections,
        connect: function (props) {
            try {
                connection.useDb(props);
                return connection;
            }
            catch (err) {
                throw err;
            }
        },
        createConnection: function (props) {
            try {
                let _conn = new Connection_1.default(props);
                connections.push(_conn);
                return _conn;
            }
            catch (err) {
                throw err;
            }
        },
        escape: (value) => promise_1.default.escape(value),
        format: (sql, values) => promise_1.default.format(sql, values),
        execute: (sql, db) => {
            if (db)
                return db.execute(sql);
            else if (connection.db)
                return connection.db.execute(sql);
            else
                throw "Database isn't connected.";
        },
        query: (sql, db) => {
            if (db)
                return db.query(sql);
            else if (connection.db)
                return connection.db.query(sql);
            else
                throw "Database isn't connected.";
        },
    };
})();
exports.default = Singleton;
