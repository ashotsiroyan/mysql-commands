const mysql = require('./mysql');
const Model = require('./Model');
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
    return new Model(table, Schema.getParams());
}

module.exports = {
    connect,
    Schema,
    model
}