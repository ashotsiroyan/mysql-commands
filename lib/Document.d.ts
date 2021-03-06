import Connection from './Connection';
import Schema from './Schema';
interface DocumentParams {
    schema: Schema;
    db: Connection;
    modelName: string;
    isNew?: boolean;
    doc: object;
}
interface IDocument {
    update(doc: any): Promise<Document>;
    update(doc: any, callback: (err: any, res?: Document) => void): void;
    save(): Document | Promise<Document>;
    save(callback: (err: any, res?: Document) => void): void;
    remove(): Document | Promise<Document>;
    remove(callback: (err: any, res?: Document) => void): void;
}
declare class Document implements IDocument {
    #private;
    [name: string]: any;
    constructor(params: DocumentParams);
    get schema(): Schema;
    get modelName(): string;
    get isNew(): boolean;
    /** Sends an save command with this document _id as the query selector.  */
    save(): Promise<Document>;
    save(callback: (err: any, res?: Document) => void): void;
    /** Sends an update command with this document _id as the query selector.  */
    update(doc: any): Promise<Document>;
    update(doc: any, callback: (err: any, res?: Document) => void): void;
    /** Remove document with this document _id as the query selector.  */
    remove(): Document | Promise<Document>;
    remove(callback: (err: any, res?: Document) => void): void;
    private convertData;
}
export default Document;
