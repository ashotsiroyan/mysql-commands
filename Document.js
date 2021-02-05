const {pool} = require('./mysql');
const ObjectId = require('./plugins/ObjectId');

class Document{
    #preSave;
    #checkDb;
    #schema;
    #table;
    #options;
    #isNew;
    constructor({doc, schema, options, preSave, checkDb, table, isNew = false}){
        this.#preSave = preSave;
        this.#checkDb = checkDb;
        this.#schema = schema;
        this.#options = options;
        this.#table = table;
        this.#isNew = isNew;

        this.#convertData({doc});
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
                    query += ` ${updateString.slice(0, -2)} WHERE _id = ${pool.escape(this._id)}`;

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
    #convertData = ({doc}) =>{
        const hasId = this.#options._id === undefined || this.#options._id?true:false;

        let keys = Object.keys(this.schema);
        keys.forEach((key)=>{
            if(this.isNew){
                let defaultValue = this.schema[key].default,
                    value = '';
    
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

module.exports = Document;