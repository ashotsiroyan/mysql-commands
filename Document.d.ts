import { SchemaDefinition, SchemaOptions } from './Schema';
interface DocumentParams {
    preSave: ((params: object, fn: () => void) => any) | undefined;
    checkDb: (next: () => any) => any;
    schema: SchemaDefinition;
    table: string;
    options: SchemaOptions;
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
    get tableName(): string;
    get isNew(): boolean;
    remove(): Document | Promise<Document>;
    remove(callback: (err: any, res?: Document) => void): void;
    save(): Document | Promise<Document>;
    save(callback: (err: any, res?: Document) => void): void;
    private convertData;
}
export default Document;
