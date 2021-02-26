import { dataTypes } from './plugins/dataTypes';
import Document from './Document';
declare type SchemaDefinitionParams = {
    type?: dataTypes;
    default?: any;
    size?: number;
    primaryKey?: boolean;
    autoinc?: boolean;
    null?: boolean;
    unsigned?: boolean;
    unique?: boolean;
    trim?: boolean;
    lowercase?: boolean;
    uppercase?: boolean;
    [other: string]: any;
};
interface SchemaIndex {
    [field: string]: string;
}
interface SchemaOptions {
    _id?: boolean;
    timestamps?: boolean;
}
interface SchemaMethods {
    save?: (params: any, next: () => void) => void;
    insertMany?: (params: any, next: () => void) => void;
    update?: (params: any, next: () => void) => void;
    remove?: (params: any, next: () => void) => void;
}
export interface SchemaDefinition {
    [filed: string]: SchemaDefinitionParams | dataTypes;
}
declare class Schema {
    private indexes;
    readonly options: SchemaOptions;
    obj: SchemaDefinition;
    readonly methods: SchemaMethods;
    get query(): string;
    constructor(definition: SchemaDefinition, options: SchemaOptions);
    pre(method: keyof SchemaMethods, callBack: (params: Document, next: () => void) => void): void;
    remove(field: string): void;
    index(fields: SchemaIndex): void;
    private convertToString;
}
export default Schema;
