import Document from './Document';
import { DocProps } from './Model';
declare type SortType = {
    [field: string]: -1 | 1;
};
declare class DocumentQuery {
    private mainQuery;
    private skipQuery;
    private sortQuery;
    private limitQuery;
    private docProps;
    private fnName;
    private dbQuery;
    constructor(query: string, docProps: DocProps, fnName: string);
    limit(val: number | string): this;
    skip(val: number | string): this;
    sort(arg: SortType): this;
    exec(): Promise<Document>;
    exec(callback: (err: any, res?: Document) => void): void;
}
export default DocumentQuery;
