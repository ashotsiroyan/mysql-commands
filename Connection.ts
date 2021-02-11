import mysql from 'mysql2/promise';
import Schema from './Schema';
import Model from './Model';

export type sessionParams = {
    execute: (sql: string, values?: any) => any;
    query: (sql: string, values?: any) => any;
}

type ConnectionModel = {
    [model: string]: Model;
}

class Connection{
    name: string;
    db: any;
    models: ConnectionModel = {};
    constructor(db?: any, dbName?: string){
        this.name = dbName?dbName:'';
        this.db = db;
    }
    model(table: string, Schema: Schema){
        let model = new Model(table, Schema, ()=> this);
        this.models[table] = model;

        return model;
    }
    modelNames(): string[]{
        return Object.keys(this.models);
    }
    deleteModel(model: string){
        delete this.models[model];

        return this;
    }
}

export default Connection;