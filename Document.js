const {pool} = require('./mysql');
const ObjectId = require('./plugins/ObjectId');

class Document{
    #preSave;
    #checkDb;
    #schema;
    #table;
    #isNew;
    constructor({doc, schema, options, preSave, checkDb, table, isNew = false}){
        this.#preSave = preSave;
        this.#checkDb = checkDb;
        this.#schema = schema;
        this.#table = table;
        this.#isNew = isNew;

        this.#convertData({doc, options});
    }
    get isNew(){
        return this.#isNew;
    }
    get schema(){
        return this.#schema;
    }
    save(callback){
        try{
            let query = this.isNew?"INSERT INTO " + this.#table:`UPDATE ${this.#table} SET`,
                cols = "",
                values = "",
                updateString = "";

            const insert = () =>{
                let keys = Object.keys(this.schema);
                keys.forEach((key, i)=>{
                    let value = pool.escape(this[key]);
    
                    if(this.isNew){
                        cols += `${key}${i !== keys.length - 1?', ':''}`;
                        values += `${value}${i !== keys.length - 1?', ':''}`;
                    }else if(key !== '_id'){
                        updateString += `${key} = ${value}${i !== keys.length - 1?', ':''}`;
                    }
                });
                
                if(this.isNew)
                    query += ` (${cols}) VALUES (${values})`;
                else
                    query += ` ${updateString} WHERE _id = ${pool.escape(this._id)}`;

                return this.#checkDb(()=>{
                    return pool.execute(query)
                        .then(()=>{
                            if(callback)
                                callback(null);
                            else
                                return true;
                        })
                        .catch((err)=>{
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
    #convertData = ({doc, options}) =>{
        const hasId = options._id === undefined || options._id?true:false;

        let keys = Object.keys(this.schema);
        keys.forEach((key)=>{
            let defaultValue = this.schema[key].default;
            let value = doc[key]?doc[key]:defaultValue?defaultValue:key === '_id' && hasId?ObjectId():'';

            this[key] = value;
        });
    }
}

module.exports = Document;