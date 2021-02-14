import mysql from 'mysql2/promise';
import Schema from './Schema';
import Model from './Model';

export type ConnectionParams = {
    host: string;
    user: string;
    password: string;
    database: string;
}

type ConnectionModel = {
    [model: string]: Model<any>;
}

class Connection{
    public name: string;
    public db?: mysql.Pool;
    public models: ConnectionModel = {};
    constructor(props?: ConnectionParams){
        this.name = props?props.database:'';
        this.db = props?mysql.createPool(props):undefined;
    }

    /**  Switches to a different database using the same connection pool. */
    useDb(props: ConnectionParams){
        this.name = props.database;
        this.db = mysql.createPool(props);

        return this;
    }

    /**
     * Defines or retrieves a model.
     * @param table the mysql db table name and the model name
     * @param schema a schema. necessary when defining a model
     * @returns The compiled model
     */
    model(table: string, Schema: Schema){
        let model = new Model(table, Schema, this);
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

    /** Closes the connection */
    close(callback?: (err: any) => void){
        if(this.db){
            this.db.end()
                .then(()=>{
                    if(callback)
                        callback(null);
                })
                .catch((err)=>{
                    if(callback)
                        callback(err);
                    else
                        throw err;
                });
        }
    }
}

export default Connection;
