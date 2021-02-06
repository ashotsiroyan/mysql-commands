import mysql from './mysql';
import ObjectId from './plugins/ObjectId';

import {SchemaDefinition, SchemaOptions} from './Schema';

const pool = mysql.pool;

interface IDocument{
    preSave: ((params: object, fn:()=>void)=>void) | undefined;
    checkDb: (fn:()=>void)=>void;
    schema: SchemaDefinition;
    table: string;
    options: SchemaOptions;
    isNew?: boolean;
    doc: object;
}

class Document{
    #preSave: ((params: object, fn:()=>void)=>void) | undefined;
    #checkDb: (fn:()=>void)=>void;
    #schema: SchemaDefinition;
    #table: string;
    #options: SchemaOptions;
    #isNew: boolean;
    [name: string]: any;
    constructor(params: IDocument){
        this.#preSave = params.preSave;
        this.#checkDb = params.checkDb;
        this.#schema = params.schema;
        this.#options = params.options;
        this.#table = params.table;
        this.#isNew = params.isNew || false;

        this.convertData({doc: params.doc});
    }
    get tableName(){
        return this.#table;
    }
    get isNew(){
        return this.#isNew;
    }
    save(callback?: (err: any, res?: any)=>void){
        try{
            let query = this.isNew?"INSERT INTO " + this.tableName:`UPDATE ${this.tableName} SET`,
                cols = "",
                values = "",
                updateString = "";

            const insert = () =>{
                let keys = Object.keys(this.#schema);
                keys.forEach((key)=>{
                    let value = this[key];

                    if(!this.isNew && this.#options.timestamps && key === '_updatedAt')
                        value = new Date();

                    value = pool.escape(value);
    
                    if(this.isNew){
                        cols += `${key}, `;
                        values += `${value}, `;
                    }else if(key !== '_id' && key !== 'id'){
                        updateString += `${key} = ${value}, `;
                    }
                });
                
                if(this.isNew)
                    query += ` (${cols.slice(0, -2)}) VALUES (${values.slice(0, -2)})`;
                else
                    query += ` ${updateString.slice(0, -2)} WHERE _id = ${pool.escape(this['_id'])}`;

                return this.#checkDb(()=>{
                    return pool.execute(query)
                        .then(()=>{
                            if(callback)
                                callback(null);
                            else
                                return true;
                        })
                        .catch((err:any)=>{
                            throw err;
                        });
                });
            }

            if(this.#preSave)
                this.#preSave(this, insert);
            else
                insert();            
        }catch(err){
            if(callback)
                callback(err);
            else
                throw err;
        }
    }
    private convertData({doc}:any){
        const hasId = this.#options._id === undefined || this.#options._id?true:false;

        let keys = Object.keys(this.#schema);
        keys.forEach((key)=>{
            if(this.isNew){
                let defaultValue = undefined,
                    value:any = '';

                if(typeof this.#schema[key] !== 'string'){
                    defaultValue = (this.#schema[key] as SchemaDefinition).default;
                }

                if(doc[key])
                    value = doc[key];
                else if(defaultValue)
                    value = defaultValue;
    
                if(hasId && key === '_id')
                    value = ObjectId();
    
                this[key] = value;
            }else if(doc[key]){
                this[key] = doc[key];
            }
        });
    }
}

export default Document;