import mysql from './mysql';
import Model from './Model';
import Schema from './Schema';
import Document from './Document';
import {ConnectionParams} from './Connection';


/**
 * Opens the default mysql commands connection.
 * @returns pseudo-promise wrapper around this
 */
async function connect(params: ConnectionParams){
    try{
        return await mysql.connect(params);
    }catch(err) {
        throw err;
    }
}

/**
 * Defines or retrieves a model.
 * @param table the mysql db table and the model name
 * @param schema a schema. necessary when defining a model
 * @returns The compiled model
 */
function model<T extends Document>(table: string, schema: Schema){
    return new Model<T>(table, schema);
}

/** Returns the default connection of the mysql commands module. */
const connection = mysql.connection;


export {
    connect,
    Schema,
    model,
    connection
}