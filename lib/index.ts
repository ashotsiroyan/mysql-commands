import mysql, {connectionParams} from './mysql';
import Model from './Model';
import Schema from './Schema';
import Document from './Document';


async function connect(params: connectionParams){
    try{
        await mysql.connect(params);

        return true;
    }catch(err) {
        throw err;
    }
}

function model<T extends Document>(table: string, Schema: Schema){
    return new Model<T>(table, Schema);
}

export {
    connect,
    Schema,
    model
}