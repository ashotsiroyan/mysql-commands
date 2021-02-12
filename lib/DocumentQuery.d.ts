import Document from './Document';
import { DocProps } from './Model';
declare type SortType = {
    [field: string]: -1 | 1;
};
declare type FunName = 'find' | 'findOne' | 'findById';
declare class DocumentQuery<T, DocType extends Document> {
    private mainQuery;
    private skipQuery;
    private sortQuery;
    private limitQuery;
    private docProps;
    private fnName;
    constructor(query: string, docProps: DocProps, fnName: FunName);
    limit(val: number | string): this;
    skip(val: number | string): this;
    sort(arg: SortType): this;
    exec(): Promise<T>;
    exec(callback: (err: any, res?: T) => void): void;
    private checkDb;
}
export default DocumentQuery;
