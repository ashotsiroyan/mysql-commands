interface ISingleton {
    pool: {
        execute: (sql: string, values?: any) => any;
        query: (sql: string, values?: any) => any;
        escape: (value: string) => any;
        format: (sql: string, values?: any) => any;
    };
    connect: (props: any) => boolean | undefined;
}
export declare type connectionParams = {
    host: string;
    user: string;
    password: string;
    database: string;
};
declare var Singleton: ISingleton;
export default Singleton;
