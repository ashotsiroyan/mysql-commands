import { SchemaDefinition, SchemaOptions } from './Schema';
interface DocumentParams {
    preSave: ((params: object, fn: () => void) => void) | undefined;
    checkDb: (fn: () => void) => void;
    schema: SchemaDefinition;
    table: string;
    options: SchemaOptions;
    isNew?: boolean;
    doc: object;
}
declare class Document {
    #private;
    [name: string]: any;
    constructor(params: DocumentParams);
    get tableName(): string;
    get isNew(): boolean;
    save(): Document | Promise<Document>;
    save(callback: (err: any, res?: Document) => void): void;
    private convertData;
}
export default Document;
