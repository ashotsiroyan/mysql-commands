import Document from './Document';
import { DocumentQuery } from './Query';
import Schema from './Schema';
import Connection from './Connection';
export declare type QuerySelector = {
    $eq?: any;
    $gt?: any;
    $gte?: any;
    $in?: string | string[] | number | number[];
    $lt?: any;
    $lte?: any;
    $ne?: any;
    $nin?: string | string[] | number | number[];
};
export declare type RootQuerySelector = {
    _id?: string;
    $or?: Array<FilterQuery>;
    $and?: Array<FilterQuery>;
};
export declare type FilterQuery = {
    [field: string]: QuerySelector | string | number;
};
interface IModel<T extends Document> {
    new: (doc?: any) => T;
    find(conditions?: RootQuerySelector | FilterQuery, fields?: string[]): DocumentQuery<T[], T>;
    find(conditions: RootQuerySelector | FilterQuery, fields: string[], callback: (err: any, res?: T[]) => void): DocumentQuery<T[], T>;
    findOne(conditions?: RootQuerySelector | FilterQuery, fields?: string[]): DocumentQuery<T | null, T>;
    findOne(conditions: RootQuerySelector | FilterQuery, fields: string[], callback: (err: any, res?: T) => void): DocumentQuery<T | null, T>;
    findById(id: string, fields?: string[]): DocumentQuery<T | null, T>;
    findById(id: string, fields: string[], callback: (err: any, res?: T) => void): DocumentQuery<T | null, T>;
    insertOne(params: object): Promise<T>;
    insertOne(params: object, callback: (err: any, res?: T) => void): void;
    insertMany(params: object[]): Promise<T[]>;
    insertMany(params: object[], callback: (err: any, res?: T[]) => void): void;
    updateOne(conditions: RootQuerySelector | FilterQuery, update: any): Promise<any>;
    updateOne(conditions: RootQuerySelector | FilterQuery, update: any, callback: (err: any, raw?: any) => void): void;
    updateMany(conditions: RootQuerySelector | FilterQuery, update: any): Promise<any>;
    updateMany(conditions: RootQuerySelector | FilterQuery, update: any, callback: (err: any, raw?: any) => void): void;
    deleteOne(conditions: RootQuerySelector | FilterQuery): Promise<void>;
    deleteOne(conditions: RootQuerySelector | FilterQuery, callback: (err: any) => void): void;
    deleteMany(conditions: RootQuerySelector | FilterQuery): Promise<void>;
    deleteMany(conditions: RootQuerySelector | FilterQuery, callback: (err: any) => void): void;
    countDocuments(conditions: RootQuerySelector | FilterQuery): Promise<number>;
    countDocuments(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: number) => void): void;
}
declare class Model<T extends Document> implements IModel<T> {
    readonly schema: Schema;
    readonly db: Connection;
    readonly modelName: string;
    constructor(name: string, schema: Schema, db: Connection);
    new(doc?: any): T;
    find(callback?: (err: any, res?: T[]) => void): DocumentQuery<T[], T>;
    find(conditions: RootQuerySelector | FilterQuery, callback?: (err: any, res?: T[]) => void): DocumentQuery<T[], T>;
    find(conditions: RootQuerySelector | FilterQuery, fields?: string[], callback?: (err: any, res?: T[]) => void): DocumentQuery<T[], T>;
    findOne(callback?: (err: any, res?: T) => void): DocumentQuery<T | null, T>;
    findOne(conditions: RootQuerySelector | FilterQuery, callback?: (err: any, res?: T) => void): DocumentQuery<T | null, T>;
    findOne(conditions: RootQuerySelector | FilterQuery, fields?: string[], callback?: (err: any, res?: T) => void): DocumentQuery<T | null, T>;
    findById(id: string, callback?: (err: any, res?: T) => void): DocumentQuery<T | null, T>;
    findById(id: string, fields?: string[], callback?: (err: any, res?: T) => void): DocumentQuery<T | null, T>;
    insertOne(params: object): Promise<T>;
    insertOne(params: object, callback: (err: any, res?: Document) => void): void;
    insertMany(params: object[]): Promise<T[]>;
    insertMany(params: object[], callback: (err: any, res?: T[]) => void): void;
    updateOne(conditions: RootQuerySelector | FilterQuery, doc: any): Promise<any>;
    updateOne(conditions: RootQuerySelector | FilterQuery, doc: any, callback: (err: any, raw?: any) => void): void;
    updateMany(conditions: RootQuerySelector | FilterQuery, doc: any): Promise<any>;
    updateMany(conditions: RootQuerySelector | FilterQuery, doc: any, callback: (err: any, raw?: any) => void): void;
    deleteOne(conditions?: RootQuerySelector | FilterQuery): Promise<void>;
    deleteOne(conditions: RootQuerySelector | FilterQuery, callback: (err: any) => void): void;
    deleteMany(conditions?: RootQuerySelector | FilterQuery): Promise<void>;
    deleteMany(conditions: RootQuerySelector | FilterQuery, callback: (err: any) => void): void;
    countDocuments(conditions?: RootQuerySelector | FilterQuery): Promise<number>;
    countDocuments(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: number) => void): void;
    private checkDb;
}
export default Model;
