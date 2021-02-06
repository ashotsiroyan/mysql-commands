import Document from './Document';
import { returnParams, SchemaDefinition } from './Schema';
interface IModel {
    new: (doc: any) => Document;
    find: (conditions?: object, fields?: any[]) => this | undefined;
    findOne: (conditions?: object, fields?: any[]) => this | undefined;
    findById: (id: string, fields?: any[]) => this | undefined;
    insertOne: (params: object, callback?: (err: any, res?: any) => any) => Promise<any> | void;
    insertMany: (params: any[], callback?: (err: any, res?: any) => any) => Promise<any> | void;
    findAndUpdate: (conditions: object, update: any, callback?: (err: any, res?: any) => any) => Promise<any> | void;
    findByIdAndUpdate: (id: string, update: any, callback?: (err: any, res?: any) => any) => Promise<any> | void;
    findAndDelete: (conditions: any, callback?: (err: any, res?: any) => any) => Promise<any> | void;
    findByIdAndDelete: (id: string, callback?: (err: any, res?: any) => any) => Promise<any> | void;
    limit: (val: number | string) => this | undefined;
    skip: (val: number | string) => this | undefined;
    sort: (arg: any[]) => this | undefined;
    countDocuments: (conditions: object, callback?: (err: any, res?: any) => any) => void;
    exec: (callback?: (err: any, res?: any) => any) => Promise<any> | void;
}
declare class Model implements IModel {
    private mysqlStructure;
    private methods;
    private query;
    private documentParams;
    constructor(table: string, SchemaParams: returnParams);
    get schema(): SchemaDefinition;
    get tableName(): string;
    new(doc?: any): Document;
    find(conditions?: object, fields?: any[]): this;
    findOne(conditions?: object, fields?: any[]): this;
    findById(id: string, fields?: any[]): this | undefined;
    insertOne(params?: object, callback?: (err: any, res?: any) => any): void;
    insertMany(params?: any[], callback?: (err: any, res?: any) => any): void;
    findAndUpdate(conditions: object, update?: any, callback?: (err: any, res?: any) => any): void;
    findByIdAndUpdate(id: string, update?: any, callback?: (err: any, res?: any) => any): void;
    findAndDelete(conditions: any, callback?: (err: any, res?: any) => any): any;
    findByIdAndDelete(id: string, callback?: (err: any, res?: any) => any): any;
    limit(val: number | string): this;
    skip(val: number | string): this;
    sort(arg: any): this;
    countDocuments(conditions?: object, callback?: (err: any, res?: any) => any): any;
    exec(callback?: (err: any, res?: any) => any): any;
    private checkDb;
}
export default Model;
