const mysql = require('./mysql');
const Document = require('./Document');
const Schema = require('./Schema');

async function connect({host, user, password, database}){
    try{
        await mysql.connect({host, user, password, database});

        return true;
    }catch(err) {
        throw err;
    }
}

function model(table, Schema) {
    return new Document(table, Schema.getMysqlString(), Schema.getDefinition());
}

module.exports = {
    connect,
    Schema,
    model
}