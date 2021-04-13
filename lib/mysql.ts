import mysql from 'mysql2/promise';
import Connection, {ConnectionParams} from './Connection';
import {joinWithFields} from './plugins/functions';


interface Imysql {
    connection: Connection;
    connections: Connection[];
    connect: (props: ConnectionParams) => Promise<Connection>;
    createConnection: (props: ConnectionParams) => Promise<Connection>;
    escape: (value: any) => string;
    format: (sql: string, values?: any) => string;
    execute: (sql: string, db?: mysql.Pool) => any;
    query: (sql: string, db?: mysql.Pool) => any;
}

var Singleton: Imysql = (function() {
    var connection: Connection = new Connection(),
        connections: Connection[] = [connection];

    return {
        connection,
        connections,
        connect: async function (props: ConnectionParams) {
            try{
                connection.useDb(props);

                let keys = Object.keys(connection.models);

                for(let i = 0; i < keys.length; ++i){
                    let model = connection.models[keys[i]],
                        {columns, indexes, fileds} = model.schema.query;

                    await Singleton.execute(`CREATE TABLE IF NOT EXISTS ${model.modelName} (${columns.join(', ')}${indexes.length > 0?`, INDEX ${indexes.join(', INDEX ')}`:''});`);
                    await Singleton.execute(`ALTER TABLE ${model.modelName} ADD IF NOT EXISTS ${joinWithFields(', ADD IF NOT EXISTS ', columns, fileds)}${indexes.length > 0?`, ADD INDEX IF NOT EXISTS ${indexes.join(', ADD INDEX IF NOT EXISTS ')}`:''}, MODIFY IF EXISTS ${columns.join(', MODIFY IF EXISTS ')};`);
                }

                return connection;
            }catch(err){
                throw err;
            }
        },
        createConnection: async function (props: ConnectionParams) {
            try{
                let _conn = new Connection(props);

                let keys = Object.keys(_conn.models);

                for(let i = 0; i < keys.length; ++i){
                    let model = _conn.models[keys[i]],
                    {columns, indexes, fileds} = model.schema.query;

                    await Singleton.execute(`CREATE TABLE IF NOT EXISTS ${model.modelName} (${columns.join(', ')}${indexes.length > 0?`, INDEX ${indexes.join(', INDEX ')}`:''});`, _conn.db);
                    await Singleton.execute(`ALTER TABLE ${model.modelName} ADD IF NOT EXISTS ${joinWithFields(', ADD IF NOT EXISTS ', columns, fileds)}${indexes.length > 0?`, ADD INDEX IF NOT EXISTS ${indexes.join(', ADD INDEX IF NOT EXISTS ')}`:''}, MODIFY IF EXISTS ${columns.join(', MODIFY IF EXISTS ')};`, _conn.db);
                }

                connections.push(_conn);
    
                return _conn;
            }catch(err){
                throw err;
            }
        },
        escape: (value: string) => mysql.escape(value),
        format: (sql: string, values?: any) => mysql.format(sql, values),
        execute: (sql: string, db?: mysql.Pool) => {
            if(db)
                return db.execute(sql); 
            else if(connection.db)
                return connection.db.execute(sql); 
            else
                throw "Database isn't connected.";
        },
        query: (sql: string, db?: mysql.Pool) => {
            if(db) 
                return db.query(sql); 
            else if(connection.db) 
                return connection.db.query(sql); 
            else
                throw "Database isn't connected.";
        },
    };
})();

export default Singleton;