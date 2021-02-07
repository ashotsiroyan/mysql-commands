import mysql from 'mysql2/promise';

interface ISingleton {
    pool: {
        execute: (sql: string, values?: any) => any;
        query: (sql: string, values?: any) => any;
        escape: (value: string) => any;
        format: (sql: string, values?: any) => any;
    };
    connect: (props: any) => boolean | undefined;
}

export type connectionParams = {
    host:string;
    user:string;
    password:string;
    database:string;
}

var Singleton: ISingleton = (function() {
    var instance: any;

    return {
        pool: {
            execute: (sql: string, values?: any) => {if(instance) return instance.execute(sql, values); else throw "Isn't connected to database.";},
            query: (sql: string, values?: any) => {if(instance) return instance.query(sql, values); else throw "Isn't connected to database.";},
            escape: (value: string) => mysql.escape(value),
            format: (sql: string, values?: any) => mysql.format(sql, values)
        },
        connect: function (props: connectionParams) {
            try{
                instance = mysql.createPool(props);

                return true;
            }catch(err){
                throw err;
            }
        }
    };
})();

export default Singleton;