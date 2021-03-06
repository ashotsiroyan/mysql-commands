import Document from './Document';
import { DocumentQuery } from './Query';
import Schema from './Schema';
import Connection from './Connection';
export declare type QuerySelector = {
    /** equal */
    $eq?: any;
    /** not equal */
    $ne?: any;
    /** greater than */
    $gt?: any;
    /** greater than or equal */
    $gte?: any;
    /** like */
    $in?: string | string[] | number | number[];
    /** not like */
    $nin?: string | string[] | number | number[];
    /** less than */
    $lt?: any;
    /** less than or equal */
    $lte?: any;
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
    findOne(conditions: RootQuerySelector | FilterQuery, fields: string[], callback: (err: any, res?: T | null) => void): DocumentQuery<T | null, T>;
    findById(id: string, fields?: string[]): DocumentQuery<T | null, T>;
    findById(id: string, fields: string[], callback: (err: any, res?: T | null) => void): DocumentQuery<T | null, T>;
    insertOne(params: object): Promise<T>;
    insertOne(params: object, callback: (err: any, res?: T) => void): void;
    insertMany(params: object[]): Promise<T[]>;
    insertMany(params: object[], callback: (err: any, res?: T[]) => void): void;
    updateOne(conditions: RootQuerySelector | FilterQuery, doc: any): Promise<any>;
    updateOne(conditions: RootQuerySelector | FilterQuery, doc: any, callback: (err: any, raw?: any) => void): void;
    updateMany(conditions: RootQuerySelector | FilterQuery, doc: any): Promise<any>;
    updateMany(conditions: RootQuerySelector | FilterQuery, doc: any, callback: (err: any, raw?: any) => void): void;
    deleteOne(conditions: RootQuerySelector | FilterQuery): Promise<void>;
    deleteOne(conditions: RootQuerySelector | FilterQuery, callback: (err: any) => void): void;
    deleteMany(conditions: RootQuerySelector | FilterQuery): Promise<void>;
    deleteMany(conditions: RootQuerySelector | FilterQuery, callback: (err: any) => void): void;
    findOneAndUpdate(conditions: RootQuerySelector | FilterQuery, update: any): Promise<T | null>;
    findOneAndUpdate(conditions: RootQuerySelector | FilterQuery, update: any, callback: (err: any, res: T | null) => void): void;
    findByIdAndUpdate(id: string, update: any): Promise<T | null>;
    findByIdAndUpdate(id: string, update: any, callback: (err: any, res: T | null) => void): void;
    findOneAndDelete(conditions: RootQuerySelector | FilterQuery): Promise<T | null>;
    findOneAndDelete(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: T | null) => void): void;
    findByIdAndDelete(id: string): Promise<T | null>;
    findByIdAndDelete(id: string, callback: (err: any, res?: T | null) => void): void;
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
    findOne(callback?: (err: any, res?: T | null) => void): DocumentQuery<T | null, T>;
    findOne(conditions: RootQuerySelector | FilterQuery, callback?: (err: any, res?: T | null) => void): DocumentQuery<T | null, T>;
    findOne(conditions: RootQuerySelector | FilterQuery, fields?: string[], callback?: (err: any, res?: T | null) => void): DocumentQuery<T | null, T>;
    findById(id: string, callback?: (err: any, res?: T | null) => void): DocumentQuery<T | null, T>;
    findById(id: string, fields?: string[], callback?: (err: any, res?: T | null) => void): DocumentQuery<T | null, T>;
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
    findOneAndUpdate(conditions: RootQuerySelector | FilterQuery, update: any): Promise<T | null>;
    findOneAndUpdate(conditions: RootQuerySelector | FilterQuery, update: any, callback: (err: any, res: T | null) => void): void;
    findByIdAndUpdate(id: string, update: any): Promise<T | null>;
    findByIdAndUpdate(id: string, update: any, callback: (err: any, res: T | null) => void): void;
    findOneAndDelete(conditions: RootQuerySelector | FilterQuery): Promise<T | null>;
    findOneAndDelete(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res: T | null) => void): void;
    findByIdAndDelete(id: string): Promise<T | null>;
    findByIdAndDelete(id: string, callback: (err: any, res: T | null) => void): void;
    countDocuments(conditions?: RootQuerySelector | FilterQuery): Promise<number>;
    countDocuments(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: number) => void): void;
}
export default Model;
