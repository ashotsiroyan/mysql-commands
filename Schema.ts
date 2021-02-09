import { dataTypes, dataTypesOptions } from './plugins/dataTypes';
import Document from './Document';

export interface returnParams{
    sqlString: string;
    definition: SchemaDefinition;
    methods: SchemaMethods;
    options: SchemaOptions;
}

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

export interface SchemaOptions {
    _id?: boolean;
    timestamps?: boolean;
}

export interface SchemaMethods {
    save?: (params:any, next: ()=> void ) => void;
    update?: (params:any, next: ()=> void ) => void;
}

export interface SchemaDefinition{
    [filed: string]: SchemaDefinitionParams | dataTypes;
}

class Schema{
    private indexes:any = {};
    private options: SchemaOptions;
    private definition: SchemaDefinition;
    private methods: SchemaMethods;
    constructor(definition: SchemaDefinition, options: SchemaOptions){
        this.definition = definition;
        this.options = options;
        this.methods = {};
    }
    public get SchemaParams(){
        return({
            sqlString: this.convertToString(),
            definition: this.definition,
            methods: this.methods,
            options: this.options
        })
    }
    pre(method: 'save' | 'update', callBack: (params: Document, next: ()=> void ) => void){
        this.methods[method] = callBack;
    }
    remove(field: string){
        delete this.definition[field];
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
            if(this.definition[key] !== undefined){
                if(!exists(fields[key])){
                    this.indexes[fields[key]] = [key];
                }else{
                    this.indexes[fields[key]].push(key);
                }
            }
        });
    }
    private convertToString(){
        const hasId = this.options._id === undefined || this.options._id?true:false;
        let mysql: string = "",
            indexSql: string = "";

        if(hasId)
            this.definition = {_id: {type: 'VARCHAR', size: 24, primaryKey: true}, ...this.definition};

        if(this.options.timestamps)
            this.definition = {...this.definition, _createdAt: {type: 'DATE', default: new Date()}, _updatedAt: {type: 'DATE', default: new Date()}};
            
        Object.keys(this.definition).forEach((field, i)=>{
            let option = this.definition[field];
            mysql += `${field} `;

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

            if(i !== Object.keys(this.definition).length - 1)
                mysql += ", ";
        });

        Object.keys(this.indexes).forEach((index, i)=>{
            indexSql += `INDEX ${index} (`;

            this.indexes[index].forEach((field:any, j:number)=>{
                if(this.definition[field])
                    indexSql += `${field}${j !== this.indexes[index].length - 1?', ':''}`;
            });

            indexSql += `)${i !== Object.keys(this.indexes).length - 1?', ':''}`;
        });

        if(indexSql.trim() !== '')
            mysql += ', ' + indexSql;

        return mysql;
    }
}

export default Schema;