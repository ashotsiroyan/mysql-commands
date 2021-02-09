import { dataTypes } from './plugins/dataTypes';
import Document from './Document';
export interface returnParams {
    sqlString: string;
    definition: SchemaDefinition;
    methods: SchemaMethods;
    options: SchemaOptions;
}
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
export interface SchemaOptions {
    _id?: boolean;
    timestamps?: boolean;
}
export interface SchemaMethods {
    save?: (params: any, next: () => void) => void;
    update?: (params: any, next: () => void) => void;
}
export interface SchemaDefinition {
    [filed: string]: SchemaDefinitionParams | dataTypes;
}
declare class Schema {
    private indexes;
    private options;
    private definition;
    private methods;
    constructor(definition: SchemaDefinition, options: SchemaOptions);
    get SchemaParams(): {
        sqlString: string;
        definition: SchemaDefinition;
        methods: SchemaMethods;
        options: SchemaOptions;
    };
    pre(method: 'save' | 'update', callBack: (params: Document, next: () => void) => void): void;
    remove(field: string): void;
    index(fields: SchemaIndex): void;
    private convertToString;
}
export default Schema;
