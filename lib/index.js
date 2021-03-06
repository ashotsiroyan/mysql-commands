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
 * Opens the default sqltool connection.
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
/** Returns the default connection of the sqltool module. */
let connection = mysql_1.default.connection;
exports.connection = connection;
/** An array containing all connections associated with this sqltool instance. */
let connections = mysql_1.default.connections;
exports.connections = connections;
/**
 * Defines or retrieves a model.
 * @param name model and mysql db table name
 * @param schema a schema. necessary when defining a model
 * @returns The compiled model
 */
function model(name, schema) {
    return connection.model(name, schema);
}
exports.model = model;
