import mysql from './mysql';
import Schema from './Schema';


/**
 * Opens the default mysql commands connection.
 * @param params MySQL connection params
 * @returns the default Connection object
 */
let connect = mysql.connect;

/**
 * Creates a Connection instance.
 * Each connection instance maps to a single database. This method is helpful
 *   when mangaging multiple db connections.
 * @param params MySQL connection params
 * @returns the created Connection object
 */
let createConnection = mysql.createConnection;

/** Returns the default connection of the mysql commands module. */
let {connection, connections} = mysql;

/**
 * Defines or retrieves a model.
 * @param table the mysql db table and the model name
 * @param schema a schema. necessary when defining a model
 * @returns The compiled model
 */
function model(table: string, schema: Schema){
    return connection.model(table, schema);
}


export {
    connect,
    createConnection,
    Schema,
    model,
    connection,
    connections
}