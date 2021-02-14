import Model from './Model';
import Schema from './Schema';
import Document from './Document';
import { ConnectionParams } from './Connection';
/**
 * Opens the default mysql commands connection.
 * @returns pseudo-promise wrapper around this
 */
declare function connect(params: ConnectionParams): Promise<import("./Connection").default>;
/**
 * Defines or retrieves a model.
 * @param table the mysql db table and the model name
 * @param schema a schema. necessary when defining a model
 * @returns The compiled model
 */
declare function model<T extends Document>(table: string, schema: Schema): Model<T>;
/** Returns the default connection of the mysql commands module. */
declare const connection: () => import("./Connection").default;
export { connect, Schema, model, connection };
