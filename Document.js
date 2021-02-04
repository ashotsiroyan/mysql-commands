const {pool} = require('./mysql');
const ObjectId = require('./assets/ObjectId');

class Document{
    #preSave;
    #checkDb;
    #definition;
    #table;
    #isNew;
    constructor({doc, definition, options, preSave, checkDb, table, isNew = false}){
        this.#preSave = preSave;
        this.#checkDb = checkDb;
        this.#definition = definition;
        this.#table = table;
        this.#isNew = isNew;

        this.#convertData({doc, options});
    }
    #convertData = ({doc, options}) =>{
        const hasId = options.id === undefined || options.id?true:false;

        this.#definition.forEach((key)=>{
            let value = doc[key]?doc[key]:hasId && key === '_id'?ObjectId():'';

            this[key] = value;
        });
    }
    isNew(){
        return this.#isNew;
    }
    save(){
        try{
            let query = this.isNew()?"INSERT INTO " + this.#table:`UPDATE ${this.#table} SET`,
                cols = "",
                values = "",
                updateString = "";

            const insert = () =>{
                this.#definition.forEach((key, i)=>{
                    let value = pool.escape(this[key]);
    
                    if(this.isNew()){
                        cols += `${key}${i !== this.#definition.length - 1?', ':''}`;
                        values += `${value}${i !== this.#definition.length - 1?', ':''}`;
                    }else if(key !== '_id'){
                        updateString += `${key} = ${value}${i !== this.#definition.length - 1?', ':''}`;
                    }
                });
                
                if(this.isNew())
                    query += ` (${cols}) VALUES (${values})`;
                else
                    query += ` ${updateString} WHERE _id = ${pool.escape(this._id)}`;

                return this.#checkDb(()=>{
                    return pool.execute(query)
                        .then(()=>{
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
            throw err;
        }
    }
}

module.exports = Document;