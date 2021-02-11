import Connection from './Connection';
interface ISingleton {
    connection(): Connection;
    connections(): Connection[];
    connect: (props: any) => Connection;
    createConnection: (props: any) => Connection;
    escape(value: string): string;
    format(sql: string, values?: any): string;
}
export declare type connectionParams = {
    host: string;
    user: string;
    password: string;
    database: string;
};
declare var Singleton: ISingleton;
export default Singleton;
