import { dataTypes, dataTypesOptions } from './plugins/dataTypes';
import Document from './Document';


type SchemaDefinitionParams = {
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
}

interface SchemaIndex{
    [field: string]: string
}

interface SchemaOptions {
    _id?: boolean;
    timestamps?: boolean;
}

interface SchemaPreMethods {
    save?(next: ()=> void ): void;
    insertMany?(next: ()=> void ): void;
    update?(next: ()=> void ): void;
    remove?(next: ()=> void ): void;
    findOneAndUpdate?(next: ()=> void ): void;
    findOneAndDelete?(next: ()=> void ): void;
}

type SchemaMethods = {
    [name: string]: any;
}

export interface SchemaDefinition{
    [filed: string]: SchemaDefinitionParams | dataTypes;
}

class Schema{
    private indexes:any = {};
    public readonly options: SchemaOptions;
    public obj: SchemaDefinition;
    public readonly preMethods: SchemaPreMethods = {};
    // public methods: SchemaMethods = {};
    public get query(){
        return this.convertToString();
    }

    constructor(definition: SchemaDefinition, options: SchemaOptions){
        this.obj = definition;
        this.options = options;

        const hasId = this.options === undefined || this.options._id === undefined || this.options._id;

        if(hasId)
            this.obj = {_id: {type: 'VARCHAR', size: 24, primaryKey: true}, ...this.obj};

        if(Boolean(this.options) && this.options.timestamps)
            this.obj = {...this.obj, _createdAt: {type: 'DATETIME', default: () => new Date()}, _updatedAt: {type: 'DATETIME', default: () => new Date()}};
    }

    pre(method: keyof SchemaPreMethods, callBack: ( next: ()=> void ) => void){
        this.preMethods[method] = callBack;
    }

    remove(field: string){
        delete this.obj[field];
    }

    index(fields: SchemaIndex){      
        const exists = (name: string) =>{
            let is = false;

            Object.keys(this.indexes).forEach((key)=>{
                if(name === key){
                    is = true;
                    return true;
                }
            });

            return is;
        }

        Object.keys(fields).forEach((key)=>{
            if(this.obj[key] !== undefined){
                if(!exists(fields[key])){
                    this.indexes[fields[key]] = [key];
                }else{
                    this.indexes[fields[key]].push(key);
                }
            }
        });
    }

    private convertToString(){
        const hasId = this.options === undefined || this.options._id === undefined || this.options._id;
    
        let fileds = Object.keys(this.obj),
            columns: string[] = [],
            indexes: string[] = [];

        fileds.forEach((field, i)=>{
            let option = this.obj[field],
                mysql = `${field} `;

            if(typeof option !== 'string'){
                let size = "";

                if(option.size){
                    if(dataTypesOptions[option.type as string].min !== null && option.size > dataTypesOptions[option.type as string].min)
                        size = `(${option.size})`;
                    else if(dataTypesOptions[option.type as string].min)
                        size = `(${dataTypesOptions[option.type as string].min})`;

                    if(dataTypesOptions[option.type as string].max !== null && option.size < dataTypesOptions[option.type as string].max)
                        size = `(${option.size})`;
                    else if(dataTypesOptions[option.type as string].max)
                        size = `(${dataTypesOptions[option.type as string].max})`;

                }else if(dataTypesOptions[option.type as string].default){
                    size = `(${dataTypesOptions[option.type as string].default})`;
                }
                
                mysql += `${option.type}${size} `;

                if(option.null === undefined)
                    option.null = false;

                Object.keys(option).forEach((key, j)=>{
                    option = option as SchemaDefinitionParams;

                    if(key === 'null')
                        mysql += `${!option[key]?"NOT ":""}NULL`; 
                    else if(key === 'autoinc' && option[key])
                        mysql += `AUTO_INCREMENT ${!hasId?'PRIMARY':'UNIQUE'} KEY`; 
                    else if((key === 'primaryKey' || key === 'unsigned' || key === 'unique') && option[key])
                        mysql += `${key === 'primaryKey'?'PRIMARY KEY':key === 'unsigned'?'UNSIGNED':'UNIQUE KEY'}`;

                    if(key !== 'size' && key !== 'type' && j !== Object.keys(option).length - 1)
                        mysql += " ";
                });
            }else{
                mysql += `${option}${dataTypesOptions[option as string].default?"(" + dataTypesOptions[option as string].default + ")":""} NOT NULL`;
            }

            columns.push(mysql);
        });

        Object.keys(this.indexes).forEach((index, i)=>{
            indexes.push(`${index} (${this.indexes[index].join(', ')})`);
        });

        return {
            columns,
            indexes,
            fileds
        };
    }
}

export default Schema;