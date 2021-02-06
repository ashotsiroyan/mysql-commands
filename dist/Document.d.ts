import { SchemaDefinition, SchemaOptions } from './Schema';
interface IDocument {
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
    constructor(params: IDocument);
    get tableName(): string;
    get isNew(): boolean;
    save(callback?: (err: any, res?: any) => void): void;
    private convertData;
}
export default Document;
