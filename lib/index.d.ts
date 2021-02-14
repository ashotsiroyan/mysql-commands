import Schema from './Schema';
/**
 * Opens the default mysql commands connection.
 * @param params MySQL connection params
 * @returns the default Connection object
 */
declare let connect: (props: any) => import("./Connection").default;
/**
 * Creates a Connection instance.
 * Each connection instance maps to a single database. This method is helpful
 *   when mangaging multiple db connections.
 * @param params MySQL connection params
 * @returns the created Connection object
 */
declare let createConnection: (props: any) => import("./Connection").default;
/** Returns the default connection of the mysql commands module. */
declare let connection: import("./Connection").default, connections: import("./Connection").default[];
/**
 * Defines or retrieves a model.
 * @param table the mysql db table and the model name
 * @param schema a schema. necessary when defining a model
 * @returns The compiled model
 */
declare function model(table: string, schema: Schema): import("./Model").default<import("./Document").default>;
export { connect, createConnection, Schema, model, connection, connections };
