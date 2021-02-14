import mysql from 'mysql2/promise';
import Connection, {ConnectionParams} from './Connection';


interface ISingleton {
    connection(): Connection;
    connect: (props: any) => Connection;
    escape: (value: string) => any;
    format: (sql: string, values?: any) => any;
    execute: (sql: string, db?: mysql.Pool) => any;
    query: (sql: string, db?: mysql.Pool) => any;
}

var Singleton: ISingleton = (function() {
    var connection: Connection;

    return {
        connection: function () {
            return connection;
        },
        connect: function (props: ConnectionParams) {
            try{
                if(!connection)
                    connection = new Connection(props);
                else
                    connection.useDb(props);
    
                return connection;
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