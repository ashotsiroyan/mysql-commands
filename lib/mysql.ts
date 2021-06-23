import mysql from 'mysql2/promise';
import Connection, {ConnectionParams} from './Connection';
import {joinWithFields} from './plugins/functions';


interface Imysql {
    connection: Connection;
    connections: Connection[];
    connect: (props: ConnectionParams, alterTable?: boolean) => Promise<Connection>;
    createConnection: (props: ConnectionParams, alterTable?: boolean) => Promise<Connection>;
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
        connect: async function (props: ConnectionParams, alterTable?: boolean) {
            try{
                connection.useDb(props);

                for(let key in connection.models){
                    let model = connection.models[key],
                        {columns, indexes, fileds, foreignKeys} = model.schema.query;

                    await Singleton.execute(`CREATE TABLE IF NOT EXISTS ${model.modelName} (${columns.join(', ')}${indexes.length > 0?`, INDEX ${indexes.join(', INDEX ')}`:''}${foreignKeys.length > 0?`, FOREIGN KEY ${foreignKeys.join(', FOREIGN KEY ')}`:''});`);

                    if(alterTable === undefined || alterTable === true)
                        await Singleton.execute(`ALTER TABLE ${model.modelName} ADD IF NOT EXISTS ${joinWithFields(', ADD IF NOT EXISTS ', columns, fileds)}${indexes.length > 0?`, ADD INDEX IF NOT EXISTS ${indexes.join(', ADD INDEX IF NOT EXISTS ')}`:''}${foreignKeys.length > 0?`, ADD FOREIGN KEY ${foreignKeys.join(', ADD FOREIGN KEY ')}`:''}, MODIFY IF EXISTS ${columns.join(', MODIFY IF EXISTS ')};`);
                }

                return connection;
            }catch(err){
                throw err;
            }
        },
        createConnection: async function (props: ConnectionParams, alterTable?: boolean) {
            try{
                let _conn = new Connection(props);

                for(let key in _conn.models){
                    let model = _conn.models[key],
                    {columns, indexes, fileds, foreignKeys} = model.schema.query;

                    await Singleton.execute(`CREATE TABLE IF NOT EXISTS ${model.modelName} (${columns.join(', ')}${indexes.length > 0?`, INDEX ${indexes.join(', INDEX ')}`:''}${foreignKeys.length > 0?`, FOREIGN KEY ${foreignKeys.join(', FOREIGN KEY ')}`:''});`, _conn.db);
                    
                    if(alterTable === undefined || alterTable === true)
                        await Singleton.execute(`ALTER TABLE ${model.modelName} ADD IF NOT EXISTS ${joinWithFields(', ADD IF NOT EXISTS ', columns, fileds)}${indexes.length > 0?`, ADD INDEX IF NOT EXISTS ${indexes.join(', ADD INDEX IF NOT EXISTS ')}`:''}${foreignKeys.length > 0?`, ADD FOREIGN KEY ${foreignKeys.join(', ADD FOREIGN KEY ')}`:''}, MODIFY IF EXISTS ${columns.join(', MODIFY IF EXISTS ')};`, _conn.db);
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