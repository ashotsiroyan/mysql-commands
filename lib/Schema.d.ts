import { dataTypes } from './plugins/dataTypes';
declare type SchemaDefinitionParams = {
    type?: dataTypes;
    default?: any;
    size?: number;
    primaryKey?: boolean;
    foreignKey?: {
        modelName: string;
        field: string;
    };
    ref?: string;
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
    objectId?: boolean;
}
interface SchemaPreMethods {
    save?(next: () => void): void;
    insertMany?(next: () => void): void;
    update?(next: () => void): void;
    remove?(next: () => void): void;
    findOneAndUpdate?(next: () => void): void;
    findOneAndDelete?(next: () => void): void;
}
export interface SchemaDefinition {
    [filed: string]: SchemaDefinitionParams | dataTypes;
}
declare class Schema {
    private indexes;
    readonly options: SchemaOptions;
    obj: SchemaDefinition;
    readonly preMethods: SchemaPreMethods;
    get query(): {
        columns: string[];
        indexes: string[];
        fileds: string[];
        foreignKeys: string[];
    };
    constructor(definition: SchemaDefinition, options: SchemaOptions);
    pre(method: keyof SchemaPreMethods, callBack: (next: () => void) => void): void;
    remove(field: string): void;
    index(fields: SchemaIndex): void;
    private convertToString;
}
export default Schema;
