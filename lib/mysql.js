"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const Connection_1 = __importDefault(require("./Connection"));
const functions_1 = require("./plugins/functions");
var Singleton = (function () {
    var connection = new Connection_1.default(), connections = [connection];
    return {
        connection,
        connections,
        connect: function (props, alterTable) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    connection.useDb(props);
                    for (let key in connection.models) {
                        let model = connection.models[key], { columns, indexes, fileds, foreignKeys } = model.schema.query;
                        yield Singleton.execute(`CREATE TABLE IF NOT EXISTS ${model.modelName} (${columns.join(', ')}${indexes.length > 0 ? `, INDEX ${indexes.join(', INDEX ')}` : ''}${foreignKeys.length > 0 ? `, FOREIGN KEY ${foreignKeys.join(', FOREIGN KEY ')}` : ''});`);
                        if (alterTable === undefined || alterTable === true)
                            yield Singleton.execute(`ALTER TABLE ${model.modelName} ADD IF NOT EXISTS ${functions_1.joinWithFields(', ADD IF NOT EXISTS ', columns, fileds)}${indexes.length > 0 ? `, ADD INDEX IF NOT EXISTS ${indexes.join(', ADD INDEX IF NOT EXISTS ')}` : ''}${foreignKeys.length > 0 ? `, ADD FOREIGN KEY ${foreignKeys.join(', ADD FOREIGN KEY ')}` : ''}, MODIFY IF EXISTS ${columns.join(', MODIFY IF EXISTS ')};`);
                    }
                    return connection;
                }
                catch (err) {
                    throw err;
                }
            });
        },
        createConnection: function (props, alterTable) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    let _conn = new Connection_1.default(props);
                    for (let key in _conn.models) {
                        let model = _conn.models[key], { columns, indexes, fileds, foreignKeys } = model.schema.query;
                        yield Singleton.execute(`CREATE TABLE IF NOT EXISTS ${model.modelName} (${columns.join(', ')}${indexes.length > 0 ? `, INDEX ${indexes.join(', INDEX ')}` : ''}${foreignKeys.length > 0 ? `, FOREIGN KEY ${foreignKeys.join(', FOREIGN KEY ')}` : ''});`, _conn.db);
                        if (alterTable === undefined || alterTable === true)
                            yield Singleton.execute(`ALTER TABLE ${model.modelName} ADD IF NOT EXISTS ${functions_1.joinWithFields(', ADD IF NOT EXISTS ', columns, fileds)}${indexes.length > 0 ? `, ADD INDEX IF NOT EXISTS ${indexes.join(', ADD INDEX IF NOT EXISTS ')}` : ''}${foreignKeys.length > 0 ? `, ADD FOREIGN KEY ${foreignKeys.join(', ADD FOREIGN KEY ')}` : ''}, MODIFY IF EXISTS ${columns.join(', MODIFY IF EXISTS ')};`, _conn.db);
                    }
                    connections.push(_conn);
                    return _conn;
                }
                catch (err) {
                    throw err;
                }
            });
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
