import mysql from './mysql';
import ObjectId from './plugins/ObjectId';

import {SchemaDefinition, SchemaOptions} from './Schema';

const pool = mysql.pool;

interface DocumentParams{
    preSave: ((params: object, fn:()=>void)=>any) | undefined;
    checkDb: (next:()=>any)=>any;
    schema: SchemaDefinition;
    table: string;
    options: SchemaOptions;
    isNew?: boolean;
    doc: object;
}

interface IDocument{
    remove(): Document | Promise<Document>;
    remove(callback: (err: any, res?: Document)=> void): void;

    save(): Document | Promise<Document>;
    save(callback: (err: any, res?: Document)=> void): void;
}

class Document implements IDocument{
    #preSave: ((params: object, fn:()=>void)=>any) | undefined;
    #checkDb: (next:()=>any)=>any;
    #schema: SchemaDefinition;
    #table: string;
    #options: SchemaOptions;
    #isNew: boolean;
    [name: string]: any;
    constructor(params: DocumentParams){
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

    remove(): Document | Promise<Document>;
    remove(callback: (err: any, res?: Document)=> void): void;
    remove(callback?: (err: any, res?: Document)=> void){
        try{
            if(this['_id']){
                let query = `DELETE FROM ${this.tableName} WHERE _id = ${pool.escape(this['_id'])}`;
                
                return this.#checkDb(()=>{
                    return pool.execute(query)
                        .then(()=>{
                            if(callback)
                                callback(null, this);
                            else
                                return this;
                        })
                        .catch((err: any)=>{
                            throw err;
                        });
                });
            }
            else
                throw "ID isn't filled."
        }catch(err){
            if(callback){
                callback(err);
            }else
                throw err;
        }
    }

    save(): Document | Promise<Document>;
    save(callback: (err: any, res?: Document)=> void): void;
    save(callback?: (err: any, res?: Document)=> void){
        try{
            let query = this.isNew?"INSERT INTO " + this.tableName:`UPDATE ${this.tableName} SET`;

            const insert = () =>{
                let keys = Object.keys(this.#schema),
                    cols = "",
                    values = "",
                    updateString = "";

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
                
                if(this.isNew){
                    if(cols.slice(-2) === ', ')
                        cols = cols.slice(0, -2);
                        
                    if(values.slice(-2) === ', ')
                        values = values.slice(0, -2);

                    query += ` (${cols}) VALUES (${values})`;
                }else{
                    if(updateString.slice(-2) === ', ')
                        updateString = updateString.slice(0, -2);

                    query += ` ${updateString} WHERE _id = ${pool.escape(this['_id'])}`;
                }
            }


            if(this.#preSave)
                this.#preSave(this, insert);
            else
                insert();

            return this.#checkDb(()=>{
                return pool.execute(query)
                    .then(()=>{
                        if(callback)
                            callback(null, this as Document);
                        else
                            return this as Document;
                    })
                    .catch((err:any)=>{
                        throw err;
                    });
            })
        }catch(err){
            if(callback){
                callback(err);
            }else
                throw err;
        }
    }
    private convertData({doc}: any){
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
    
                if(typeof this.#schema[key] !== 'string'){
                    let def = (this.#schema[key] as SchemaDefinition);

                    if(def.lowercase)
                        value = value.toLowerCase();

                    if(def.uppercase)
                        value = value.toUpperCase();

                    if(def.trim)
                        value = value.trim();
                }
                
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