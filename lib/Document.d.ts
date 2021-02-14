import Schema from './Schema';
interface DocumentParams {
    schema: Schema;
    table: string;
    isNew?: boolean;
    doc: object;
}
interface IDocument {
    remove(): Document | Promise<Document>;
    remove(callback: (err: any, res?: Document) => void): void;
    save(): Document | Promise<Document>;
    save(callback: (err: any, res?: Document) => void): void;
}
declare class Document implements IDocument {
    #private;
    [name: string]: any;
    constructor(params: DocumentParams);
    get schema(): Schema;
    get tableName(): string;
    get isNew(): boolean;
    save(): Document | Promise<Document>;
    save(callback: (err: any, res?: Document) => void): void;
    remove(): Document | Promise<Document>;
    remove(callback: (err: any, res?: Document) => void): void;
    private convertData;
    private checkDb;
}
export default Document;
