import mysql, {connectionParams} from './mysql';
import Model from './Model';
import Schema from './Schema';


async function connect(params: connectionParams){
    try{
        return await mysql.connect(params);
    }catch(err) {
        throw err;
    }
}

async function createConnection(params: connectionParams){
    try{
        return await mysql.createConnection(params);
    }catch(err) {
        throw err;
    }
}

function model(table: string, Schema: Schema){
    let model = new Model(table, Schema);

    return model;
}

const connection = mysql.connection;
const connections = mysql.connections;

export {
    connect,
    createConnection,
    Schema,
    model,
    connection,
    connections
}