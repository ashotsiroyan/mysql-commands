import mysql, {connectionParams} from './mysql';
import Model from './Model';
import Schema from './Schema';



async function connect(params: connectionParams){
    try{
        await mysql.connect(params);

        return true;
    }catch(err) {
        throw err;
    }
}

function model(table: string, Schema: Schema){
    return new Model(table, Schema);
}

export {
    connect,
    Schema,
    model
}