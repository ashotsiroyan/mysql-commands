import mysql from 'mysql2/promise';
import Schema from './Schema';
import Document from './Document';
import Model from './Model';
import tool from './mysql';


export type ConnectionParams = {
    /**
     * The hostname of the database you are connecting to. (Default: localhost)
     */
    host?: string;
    
    /**
     * The MySQL user to authenticate as
     */
    user?: string;
    
    /**
     * The password of that MySQL user
     */
    password?: string;
    
    /**
     * Name of the database to use for this connection
     */
    database?: string;
    
    /**
     * The milliseconds before a timeout occurs during the connection acquisition. This is slightly different from connectTimeout,
     * because acquiring a pool connection does not always involve making a connection. (Default: 10 seconds)
     */
    acquireTimeout?: number;

    /**
     * Determines the pool's action when no connections are available and the limit has been reached. If true, the pool will queue
     * the connection request and call it when one becomes available. If false, the pool will immediately call back with an error.
     * (Default: true)
     */
    waitForConnections?: boolean;

    /**
     * The maximum number of connections to create at once. (Default: 10)
     */
    connectionLimit?: number;

    /**
     * The maximum number of connection requests the pool will queue before returning an error from getConnection. If set to 0, there
     * is no limit to the number of queued connection requests. (Default: 0)
     */
    queueLimit?: number;

    /**
     * Enable keep-alive on the socket.  It's disabled by default, but the
     * user can enable it and supply an initial delay.
     */
    enableKeepAlive?: true;

    /**
     * If keep-alive is enabled users can supply an initial delay.
     */
    keepAliveInitialDelay?: number;
}

type ConnectionModel = {
    [model: string]: Model<Document>;
}

class Connection{
    public name: string;
    public db?: mysql.Pool;
    public models: ConnectionModel = {};
    constructor(props?: ConnectionParams){
        this.name = props && props.database?props.database:'';
        this.db = props?mysql.createPool(props):undefined;
    }

    /**  Switches to a different database using the same connection pool. */
    useDb(props: ConnectionParams){
        this.name = props.database?props.database:'';
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
