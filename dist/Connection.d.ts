import Schema from './Schema';
import Model from './Model';
export declare type sessionParams = {
    execute: (sql: string, values?: any) => any;
    query: (sql: string, values?: any) => any;
};
declare type ConnectionModel = {
    [model: string]: Model;
};
declare class Connection {
    name: string;
    db: any;
    models: ConnectionModel;
    constructor(db?: any, dbName?: string);
    model(table: string, Schema: Schema): Model;
    modelNames(): string[];
    deleteModel(model: string): this;
}
export default Connection;
