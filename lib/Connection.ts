import mysql from 'mysql2/promise';
import Schema from './Schema';
import Document from './Document';
import Model from './Model';
import tool from './mysql';


export type ConnectionParams = {
    host: string;
    user: string;
    password: string;
    database: string;
}

type ConnectionModel = {
    [model: string]: Model<Document>;
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
     * @param name model and mysql db table name
     * @param schema a schema. necessary when defining a model
     * @returns The compiled model
     */
    model(name: string, schema: Schema): Model<Document>{
        if(!this.models[name]){
            let model = new Model(name, schema, this);
            this.models[name] = model;
    
            return model;
        }else{
            throw `The model '${name}' already exists`;
        }
    }

    modelNames(): string[]{
        return Object.keys(this.models);
    }

    deleteModel(model: string){
        delete this.models[model];

        return this;
    }

    dropTable(name: string, callback?: (err: any) => void): Promise<void>{
        return tool.execute(`DROP TABLE ${name}`, this.db)
            .then(()=>{
                if(callback)
                    callback(null);
                else
                    return undefined;
            })
            .catch((err: any)=>{
                if(callback)
                    callback(err);
                else
                    throw err;
            });
    }

    dropDatabase(callback?: (err: any) => void): Promise<void>{
        return tool.execute(`DROP DATABASE ${this.name}`, this.db)
            .then(()=>{
                if(callback)
                    callback(null);
                else
                    return undefined;
            })
            .catch((err: any)=>{
                if(callback)
                    callback(err);
                else
                    throw err;
            });
    }

    /** Closes the connection */
    close(callback?: (err: any) => void): Promise<void> | void{
        if(this.db){
            return this.db.end()
                .then(()=>{
                    if(callback)
                        callback(null);
                    else
                        return undefined;
                })
                .catch((err)=>{
                    if(callback)
                        callback(err);
                    else
                        throw err;
                });
        }else{
            if(callback)
                callback(null);
            else
                return undefined;
        }
    }
}

export default Connection;
