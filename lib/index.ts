import mysql from './mysql';
import Schema from './Schema';


/**
 * Opens the default sqltool connection.
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

/** Returns the default connection of the sqltool module. */
let connection = mysql.connection;

/** An array containing all connections associated with this sqltool instance. */
let connections = mysql.connections;

/**
 * Defines or retrieves a model.
 * @param name model and mysql db table name
 * @param schema a schema. necessary when defining a model
 * @returns The compiled model
 */
function model(name: string, schema?: Schema){
    if(!schema)
        return connection.models[name];
    else
        return connection.model(name, schema);
}


export {
    connect,
    createConnection,
    Schema,
    model,
    connection,
    connections
}