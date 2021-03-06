import Schema from './Schema';
/**
 * Opens the default sqltool connection.
 * @param params MySQL connection params
 * @returns the default Connection object
 */
declare let connect: (props: import("./Connection").ConnectionParams, alterTable?: boolean | undefined) => Promise<import("./Connection").default>;
/**
 * Creates a Connection instance.
 * Each connection instance maps to a single database. This method is helpful
 *   when mangaging multiple db connections.
 * @param params MySQL connection params
 * @returns the created Connection object
 */
declare let createConnection: (props: import("./Connection").ConnectionParams, alterTable?: boolean | undefined) => Promise<import("./Connection").default>;
/** Returns the default connection of the sqltool module. */
declare let connection: import("./Connection").default;
/** An array containing all connections associated with this sqltool instance. */
declare let connections: import("./Connection").default[];
/**
 * Defines or retrieves a model.
 * @param name model and mysql db table name
 * @param schema a schema. necessary when defining a model
 * @returns The compiled model
 */
declare function model(name: string, schema?: Schema): import("./Model").default<import("./Document").default>;
export { connect, createConnection, Schema, model, connection, connections };
