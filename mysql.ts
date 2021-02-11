import mysql from 'mysql2/promise';
import Connection from './Connection';

interface ISingleton {
    connection(): Connection;
    connections(): Connection[];
    connect: (props: any) => Connection;
    createConnection: (props: any) => Connection;
    escape(value: string): string;
    format(sql: string, values?: any): string;
}

export type connectionParams = {
    host:string;
    user:string;
    password:string;
    database:string;
}

var Singleton: ISingleton = (function() {
    var connection: Connection,
        connections: Connection[] = [];

    return {
        connection: function () {
            return connection;
        },
        connections: function () {
            return connections;
        },
        connect: function (props: connectionParams) {
            try{
                connection = new Connection(mysql.createPool(props), props.database);
                connections.push(connection);

                return connection;
            }catch(err){
                throw err;
            }
        },
        createConnection: function (props: connectionParams) {
            try{
                let _connection = new Connection(mysql.createPool(props), props.database);
                connections.push(_connection);

                return _connection;
            }catch(err){
                throw err;
            }
        },
        escape: (value: string) => mysql.escape(value),
        format: (sql: string, values?: any) => mysql.format(sql, values)
    };
})();

export default Singleton;