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
    [other: string]: any;
};
declare type SchemaIndex = {
    [field: string]: string;
};
export interface SchemaOptions {
    _id?: boolean;
    timestamps?: boolean;
}
export interface SchemaMethods {
    ['save']?: (params: any, next: () => void) => void;
    ['update']?: (params: any, next: () => void) => void;
}
export interface SchemaDefinition {
    [filed: string]: SchemaDefinitionParams | dataTypes;
}
declare class Schema {
    private mysql;
    private options;
    private definition;
    private methods;
    constructor(definition: SchemaDefinition, options?: SchemaOptions);
    getParams(): {
        sqlString: string;
        definition: SchemaDefinition;
        methods: SchemaMethods;
        options: SchemaOptions;
    };
    pre(method: 'save' | 'update', callBack: (params: Document, next: () => void) => void): void;
    index(fields: SchemaIndex): void;
    private convertToString;
}
export default Schema;
