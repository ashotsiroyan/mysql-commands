import Document from './Document';
import Model, { RootQuerySelector, FilterQuery } from './Model';
declare type SortType = {
    [field: string]: -1 | 1;
};
export declare class DocumentQuery<T, DocType extends Document> {
    private conditions;
    private fields;
    private skipQuery;
    private sortQuery;
    private limitQuery;
    private isOne;
    private unionModels;
    readonly model: Model<DocType>;
    constructor(conditions: RootQuerySelector | FilterQuery, fields: string[], model: Model<DocType>, isOne?: boolean);
    limit(val: number | string): this;
    skip(val: number | string): this;
    sort(arg: SortType): this;
    union(model: Model<DocType> | Model<DocType>[], all?: boolean): this;
    exec(): Promise<T>;
    exec(callback: (err: any, res?: T) => void): void;
}
export declare class Query {
    readonly model: Model<any>;
    constructor(model: Model<any>);
    update(doc: any): string;
}
export {};
