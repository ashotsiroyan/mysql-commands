import { dataTypes, dataTypesOptions } from './plugins/dataTypes';

export interface returnParams{
    sqlString: string;
    definition: SchemaDefinition;
    methods: SchemaMethods;
    options: SchemaOptions;
}

export type SchemaDefinitionParams = {
    type?: dataTypes;
    default?: any;
    size?: number;
    primaryKey?: boolean;
    autoinc?: boolean;
    null?: boolean;
    unsigned?: boolean;
    unique?: boolean;
    [other: string]: any;
}

export interface SchemaOptions {
    _id?: boolean;
    timestamps?: boolean;
}

export interface SchemaMethods {
    ['save']?: (params:any, next: ()=> void ) => void;
    ['update']?: (params:any, next: ()=> void ) => void;
}

export interface SchemaDefinition{
    [filed: string]: SchemaDefinitionParams | dataTypes;
}

class Schema{
    private mysql:string = "";
    private options: SchemaOptions;
    private definition: SchemaDefinition;
    private methods: SchemaMethods;
    constructor(definition: SchemaDefinition, options: SchemaOptions = {}){
        this.definition = definition;
        this.options = options;
        this.methods = {};

        this.convertToString();
    }
    getParams(){
        return {
            sqlString: this.mysql,
            definition: this.definition,
            methods: this.methods,
            options: this.options
        }
    }
    pre(method: 'save' | 'update', callBack: (params:any, next: ()=> void ) => void){
        this.methods[method] = callBack;
    }
    index(fields:any = {}){
        let indexes:any = {},
            sqlString:string = "";
        
        const exists = (name:string) =>{
            let is = false;

            Object.keys(indexes).forEach((key)=>{
                if(name === key){
                    is = true;
                    return true;
                }
            });

            return is;
        }

        Object.keys(fields).forEach((key)=>{
            if(this.definition[key] !== undefined){
                if(!exists(fields[key])){
                    indexes[fields[key]] = [key];
                }else{
                    indexes[fields[key]].push(key);
                }
            }
        });

        Object.keys(indexes).forEach((index, i)=>{
            sqlString += `INDEX ${index} (`;

            indexes[index].forEach((field:any, j:number)=>{
                sqlString += `${field}${j !== indexes[index].length - 1?', ':''}`;
            });

            sqlString += `)${i !== Object.keys(indexes).length - 1?', ':''}`;
        });

        this.mysql += ', ' + sqlString;
    }
    private convertToString(){
        const hasId = this.options._id === undefined || this.options._id?true:false;

        if(hasId)
            this.definition = {_id: {type: 'VARCHAR', size: 24, primaryKey: true}, ...this.definition};

        if(this.options.timestamps)
            this.definition = {...this.definition, _createdAt: {type: 'DATE', default: new Date()}, _updatedAt: {type: 'DATE', default: new Date()}};
            
        Object.keys(this.definition).forEach((field, i)=>{
            let option = this.definition[field];
            this.mysql += `${field} `;

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
                
                this.mysql += `${option.type}${size} `;

                if(option.null === undefined)
                    option.null = false;

                Object.keys(option).forEach((key, j)=>{
                    option = option as SchemaDefinitionParams;

                    if(key === 'null')
                        this.mysql += `${!option[key]?"NOT ":""}NULL`; 
                    else if(key === 'autoinc' && option[key])
                        this.mysql += `AUTO_INCREMENT ${!hasId?'PRIMARY':'UNIQUE'} KEY`; 
                    else if((key === 'primaryKey' || key === 'unsigned' || key === 'unique') && option[key])
                        this.mysql += `${key === 'primaryKey'?'PRIMARY KEY':key === 'unsigned'?'UNSIGNED':'UNIQUE KEY'}`;

                    if(key !== 'size' && key !== 'type' && j !== Object.keys(option).length - 1)
                        this.mysql += " ";
                });
            }else{
                this.mysql += `${option}${dataTypesOptions[option as string].default?"(" + dataTypesOptions[option as string].default + ")":""} NOT NULL`;
            }

            if(i !== Object.keys(this.definition).length - 1)
                this.mysql += ", ";
        });
    }
}

export default Schema;