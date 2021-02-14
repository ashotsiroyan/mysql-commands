import Document from './Document';
import DocumentQuery from './DocumentQuery';
import Schema from './Schema';
import Connection from './Connection';
declare type QuerySelector = {
    $eq?: any;
    $gt?: any;
    $gte?: any;
    $in?: string | string[] | number | number[];
    $lt?: any;
    $lte?: any;
    $ne?: any;
    $nin?: string | string[] | number | number[];
};
declare type RootQuerySelector = {
    $or?: Array<FilterQuery>;
    $and?: Array<FilterQuery>;
};
declare type FilterQuery = {
    [field: string]: QuerySelector | string | number;
};
export interface DocProps {
    schema: Schema;
    db: Connection;
    table: string;
}
interface IModel<T extends Document> {
    new: (doc?: any) => Document;
    find(conditions?: RootQuerySelector | FilterQuery, fields?: string[]): DocumentQuery<T[], T>;
    find(conditions: RootQuerySelector | FilterQuery, fields: string[], callback: (err: any, res?: Document[]) => void): DocumentQuery<T[], T>;
    findOne(conditions?: RootQuerySelector | FilterQuery, fields?: string[]): DocumentQuery<T | null, T>;
    findOne(conditions: RootQuerySelector | FilterQuery, fields: string[], callback: (err: any, res?: Document) => void): DocumentQuery<T | null, T>;
    findById(id: string, fields?: string[]): DocumentQuery<T | null, T>;
    findById(id: string, fields: string[], callback: (err: any, res?: Document) => void): DocumentQuery<T | null, T>;
    insertOne(params: object): Promise<Document>;
    insertOne(params: object, callback: (err: any, res?: Document) => void): void;
    insertMany(params: object[]): Promise<Document[]>;
    insertMany(params: object[], callback: (err: any, res?: Document[]) => void): void;
    findAndUpdate(conditions: RootQuerySelector | FilterQuery, update: any): Promise<Document>;
    findAndUpdate(conditions: RootQuerySelector | FilterQuery, update: any, callback: (err: any, res?: Document) => void): void;
    findByIdAndUpdate(id: string, update: any): Promise<Document>;
    findByIdAndUpdate(id: string, update: any, callback: (err: any, res?: Document) => void): void;
    findAndDelete(conditions: RootQuerySelector | FilterQuery): Promise<Document>;
    findAndDelete(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: Document) => void): void;
    findByIdAndDelete(id: string): Promise<Document>;
    findByIdAndDelete(id: string, callback: (err: any, res?: Document) => void): void;
    countDocuments(conditions: RootQuerySelector | FilterQuery): Promise<number>;
    countDocuments(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: number) => void): void;
}
declare class Model<T extends Document> implements IModel<T> {
    private docProps;
    readonly schema: Schema;
    readonly db: Connection;
    constructor(table: string, schema: Schema, db: Connection);
    get tableName(): string;
    new(doc?: any): Document;
    find(callback?: (err: any, res?: Document[]) => void): DocumentQuery<T[], T>;
    find(conditions: RootQuerySelector | FilterQuery, callback?: (err: any, res?: Document[]) => void): DocumentQuery<T[], T>;
    find(conditions: RootQuerySelector | FilterQuery, fields?: string[], callback?: (err: any, res?: Document[]) => void): DocumentQuery<T[], T>;
    findOne(callback?: (err: any, res?: Document) => void): DocumentQuery<T | null, T>;
    findOne(conditions: RootQuerySelector | FilterQuery, callback?: (err: any, res?: Document) => void): DocumentQuery<T | null, T>;
    findOne(conditions: RootQuerySelector | FilterQuery, fields?: string[], callback?: (err: any, res?: Document) => void): DocumentQuery<T | null, T>;
    findById(id: string, callback?: (err: any, res?: Document) => void): DocumentQuery<T | null, T>;
    findById(id: string, fields?: string[], callback?: (err: any, res?: Document) => void): DocumentQuery<T | null, T>;
    insertOne(params: object): Promise<Document>;
    insertOne(params: object, callback: (err: any, res?: Document) => void): void;
    insertMany(params: object[]): Promise<Document[]>;
    insertMany(params: object[], callback: (err: any, res?: Document[]) => void): void;
    findAndUpdate(conditions: RootQuerySelector | FilterQuery, update: any): Promise<Document>;
    findAndUpdate(conditions: RootQuerySelector | FilterQuery, update: any, callback: (err: any, res?: Document) => void): void;
    findByIdAndUpdate(id: string, update: any): Promise<Document>;
    findByIdAndUpdate(id: string, update: any, callback: (err: any, res?: Document) => void): void;
    findAndDelete(conditions?: RootQuerySelector | FilterQuery): Promise<Document>;
    findAndDelete(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: Document) => void): void;
    findByIdAndDelete(id: string): Promise<Document>;
    findByIdAndDelete(id: string, callback: (err: any, res?: Document) => void): void;
    countDocuments(conditions?: RootQuerySelector | FilterQuery): Promise<number>;
    countDocuments(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: number) => void): void;
    private checkDb;
}
export default Model;
