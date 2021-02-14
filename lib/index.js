"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connections = exports.connection = exports.model = exports.Schema = exports.createConnection = exports.connect = void 0;
const mysql_1 = __importDefault(require("./mysql"));
const Schema_1 = __importDefault(require("./Schema"));
exports.Schema = Schema_1.default;
/**
 * Opens the default mysql commands connection.
 * @param params MySQL connection params
 * @returns the default Connection object
 */
let connect = mysql_1.default.connect;
exports.connect = connect;
/**
 * Creates a Connection instance.
 * Each connection instance maps to a single database. This method is helpful
 *   when mangaging multiple db connections.
 * @param params MySQL connection params
 * @returns the created Connection object
 */
let createConnection = mysql_1.default.createConnection;
exports.createConnection = createConnection;
/** Returns the default connection of the mysql commands module. */
let { connection, connections } = mysql_1.default;
exports.connection = connection;
exports.connections = connections;
/**
 * Defines or retrieves a model.
 * @param table the mysql db table and the model name
 * @param schema a schema. necessary when defining a model
 * @returns The compiled model
 */
function model(table, schema) {
    return connection.model(table, schema);
}
exports.model = model;
