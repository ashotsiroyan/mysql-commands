const mysql = require('./mysql');
const Schema = require('./Schema');

async function connect({host, user, password, database}){
    try{
        await mysql.connect({host, user, password, database});

        return true;
    }catch(err) {
        throw err;
    }
}

module.exports = {
    connect,
    Schema
}