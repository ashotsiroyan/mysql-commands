import mysql from './mysql';
import Connection from './Connection';
import Schema, {SchemaDefinition} from './Schema';
import ObjectId from './plugins/ObjectId';
import {withOptions} from './plugins/functions';


interface DocumentParams{
    schema: Schema;
    db: Connection;
    modelName: string;
    isNew?: boolean;
    doc: object;
}

interface IDocument{
    update(doc: any): Promise<Document>;
    update(doc: any, callback: (err: any, res?: Document)=> void): void;

    save(): Document | Promise<Document>;
    save(callback: (err: any, res?: Document)=> void): void;

    remove(): Document | Promise<Document>;
    remove(callback: (err: any, res?: Document)=> void): void;
}

class Document implements IDocument{
    #schema: Schema;
    #db: Connection;
    #modelName: string;
    #isNew: boolean;
    [name: string]: any;

    constructor(params: DocumentParams){
        this.#schema = params.schema;
        this.#modelName = params.modelName;
        this.#db = params.db;
        this.#isNew = params.isNew || false;

        this.convertData({doc: params.doc});
    }

    get schema(){
        return this.#schema;
    }

    get modelName(){
        return this.#modelName;
    }

    get isNew(){
        return this.#isNew;
    }

    /** Sends an save command with this document _id as the query selector.  */
    save(): Promise<Document>;
    save(callback: (err: any, res?: Document)=> void): void;
    save(callback?: (err: any, res?: Document)=> void){
        try{
            let query = this.isNew?`INSERT INTO ${this.table_name?this.table_name:this.modelName}`:`UPDATE ${this.table_name?this.table_name:this.modelName} SET`;

            const saveNext = () =>{
                let cols = "",
                    values = "",
                    updateString = "";

                for(let key in this.#schema.obj){
                    let value = this[key];

                    if(!this.isNew && Boolean(this.#schema.options) && this.#schema.options.timestamps && key === '_updatedAt')
                        value = new Date();

                    if(typeof value !== 'undefined'){
                        value = mysql.escape(withOptions(value, this.#schema.obj[key]));
        
                        if(this.isNew){
                            cols += `${key}, `;
                            values += `${value}, `;
                        }else{
                            updateString += `${key} = ${value}, `;
                        }
                    }
                };
                
                if(this.isNew){
                    if(cols.slice(-2) === ', ')
                        cols = cols.slice(0, -2);
                        
                    if(values.slice(-2) === ', ')
                        values = values.slice(0, -2);

                    query += ` (${cols}) VALUES (${values})`;
                }else{
                    if(updateString.slice(-2) === ', ')
                        updateString = updateString.slice(0, -2);

                    query += ` ${updateString} WHERE _id = ${mysql.escape(this['_id'])}`;
                }
            }


            if(this.#schema.preMethods.save)
                this.#schema.preMethods.save.call(this, saveNext);
            else
                saveNext();

            return mysql.execute(query, this.#db.db)
                .then(()=>{
                    if(this.isNew)
                        this.#isNew = false;

                    if(callback)
                        callback(null, this as Document);
                    else
                        return this as Document;
                })
                .catch((err:any)=>{
                    if(callback){
                        callback(err);
                    }else
                        throw err;
                });
        }catch(err){
            if(callback){
                callback(err);
            }else
                throw err;
        }
    }

    /** Sends an update command with this document _id as the query selector.  */
    update(doc: any): Promise<Document>;
    update(doc: any, callback: (err: any, res?: Document)=> void): void;
    update(doc: any = {}, callback?: (err: any, res?: Document)=> void){
        try{
            let keys = Object.keys(doc);

            if(keys.length > 0){
                let query = `UPDATE ${this.table_name?this.table_name:this.modelName} SET `;

                const updateNext = () =>{    
                    keys.forEach((key)=>{
                        let options = this.#schema.obj[key];

                        if(options){
                            let value = withOptions(doc[key], options);
                            this[key] = value;
        
                            value = mysql.escape(value);
    
                            query += `${key} = ${value}, `;
                        }
                    });

                    if(Boolean(this.#schema.options) && this.#schema.options.timestamps)
                        query += `_updatedAt = ${mysql.escape(new Date())}, `;
                    
                    if(query.slice(-2) === ', ')
                        query = query.slice(0, -2);
    
                    query += ` WHERE _id = ${mysql.escape(this['_id'])}`;
                }
    

                if(this.#schema.preMethods.update)
                    this.#schema.preMethods.update.call(this, updateNext);
                else
                    updateNext();
    
                return mysql.execute(query, this.#db.db)
                    .then(()=>{
                        if(callback)
                            callback(null, this as Document);
                        else
                            return this as Document;
                    })
                    .catch((err:any)=>{
                        throw err;
                    });
            }else{
                if(callback)
                    callback(null, this as Document);
                else
                    return this as Document;
            }
        }catch(err){
            if(callback){
                callback(err);
            }else
                throw err;
        }
    }

    /** Remove document with this document _id as the query selector.  */
    remove(): Document | Promise<Document>;
    remove(callback: (err: any, res?: Document)=> void): void;
    remove(callback?: (err: any, res?: Document)=> void){
        try{
            if(this['_id']){
                let query = `DELETE FROM ${this.modelName} WHERE _id = ${mysql.escape(this['_id'])}`;
                
                const removeNext = () =>{

                }

                if(this.#schema.preMethods.remove)
                    this.#schema.preMethods.remove.call(this, removeNext);
                else
                    removeNext();

                return mysql.execute(query, this.#db.db)
                    .then(()=>{
                        if(callback)
                            callback(null, this);
                        else
                            return this;
                    })
                    .catch((err: any)=>{
                        throw err;
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

    private convertData({doc}: any){
        const hasId = this.#schema.options === undefined || this.#schema.options._id === undefined || this.#schema.options._id;

        for(let key in this.#schema.obj){
            if(this.isNew){
                let defaultValue = undefined,
                    value: any = null;

                if(typeof this.#schema.obj[key] !== 'string'){
                    defaultValue = (this.#schema.obj[key] as SchemaDefinition).default;

                    if(typeof defaultValue === 'function')
                        defaultValue = (defaultValue as Function)();
                }

                if(doc[key])
                    value = withOptions(doc[key], this.#schema.obj[key]);
                else if(defaultValue)
                    value = withOptions(defaultValue, this.#schema.obj[key]);
                
                if(hasId && key === '_id' && this.#schema.options.objectId)
                    value = ObjectId();
    
                if(value)
                    this[key] = value;
            }else if(typeof doc[key] !== 'undefined'){
                this[key] = doc[key];
            }
        }

        if(!this.isNew && doc.table_name)
            this.table_name = doc.table_name;
    }
}

export default Document;