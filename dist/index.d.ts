import { connectionParams } from './mysql';
import Model from './Model';
import Schema from './Schema';
declare function connect(params: connectionParams): Promise<import("./Connection").default>;
declare function createConnection(params: connectionParams): Promise<import("./Connection").default>;
declare function model(table: string, Schema: Schema): Model;
declare const connection: () => import("./Connection").default;
declare const connections: () => import("./Connection").default[];
export { connect, createConnection, Schema, model, connection, connections };
