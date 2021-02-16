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

    save(): Promise<Document>;
    save(callback: (err: any, res?: Document)=> void): void;
    save(callback?: (err: any, res?: Document)=> void){
        try{
            let query = this.isNew?"INSERT INTO " + this.modelName:`UPDATE ${this.modelName} SET`;

            const saveNext = () =>{
                let keys = Object.keys(this.#schema.obj),
                    cols = "",
                    values = "",
                    updateString = "";

                keys.forEach((key)=>{
                    let value = this[key];

                    if(!this.isNew && this.#schema.options.timestamps && key === '_updatedAt')
                        value = new Date();

                    if(value){
                        value = mysql.escape(withOptions(value, this.#schema.obj[key]));
        
                        if(this.isNew){
                            cols += `${key}, `;
                            values += `${value}, `;
                        }else{
                            updateString += `${key} = ${value}, `;
                        }
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

                    query += ` ${updateString} WHERE _id = ${mysql.escape(this['_id'])}`;
                }
            }


            if(this.#schema.methods.save)
                this.#schema.methods.save(this, saveNext);
            else
                saveNext();

            return this.checkDb(()=>{
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

    /** Sends an update command with this document _id as the query selector.  */
    update(doc: any): Promise<Document>;
    update(doc: any, callback: (err: any, res?: Document)=> void): void;
    update(doc: any = {}, callback?: (err: any, res?: Document)=> void){
        try{
            let keys = Object.keys(doc);

            if(keys.length > 0){
                let query = `UPDATE ${this.modelName} SET `;

                const updateNext = () =>{    
                    keys.forEach((key)=>{
                        let value = withOptions(doc[key], this.#schema.obj[key]);
                        this[key] = value;
    
                        value = mysql.escape(value);

                        query += `${key} = ${value}, `;
                    });

                    if(this.#schema.options.timestamps)
                        query += `_updatedAt = ${mysql.escape(new Date())}, `;
                    
                    if(query.slice(-2) === ', ')
                        query = query.slice(0, -2);
    
                    query += ` WHERE _id = ${mysql.escape(this['_id'])}`;
                }
    

                if(this.#schema.methods.update)
                    this.#schema.methods.update(this, updateNext);
                else
                    updateNext();
    
                return this.checkDb(()=>{
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
                })
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

    remove(): Document | Promise<Document>;
    remove(callback: (err: any, res?: Document)=> void): void;
    remove(callback?: (err: any, res?: Document)=> void){
        try{
            if(this['_id']){
                let query = `DELETE FROM ${this.modelName} WHERE _id = ${mysql.escape(this['_id'])}`;
                
                const removeNext = () =>{

                }

                if(this.#schema.methods.remove)
                    this.#schema.methods.remove(this, removeNext);
                else
                    removeNext();

                return this.checkDb(()=>{
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
        const hasId = this.#schema.options._id === undefined || this.#schema.options._id?true:false;

        let keys = Object.keys(this.#schema.obj);
        keys.forEach((key)=>{
            if(this.isNew){
                let defaultValue = undefined,
                    value: any = null;

                if(typeof this.#schema.obj[key] !== 'string'){
                    defaultValue = (this.#schema.obj[key] as SchemaDefinition).default;
                }

                if(doc[key])
                    value = withOptions(doc[key], this.#schema.obj[key]);
                else if(defaultValue)
                    value = withOptions(defaultValue, this.#schema.obj[key]);
                
                if(hasId && key === '_id')
                    value = ObjectId();
    
                if(value)
                    this[key] = value;
            }else if(doc[key]){
                this[key] = doc[key];
            }
        });
    }

    private checkDb( next: ()=> any ){
        return mysql.execute(`CREATE TABLE IF NOT EXISTS ${this.modelName} (${this.schema.query})`)
            .then(()=>{
                return next();
            })
            .catch((err: any)=>{
                throw err;
            });
    }
}

export default Document;