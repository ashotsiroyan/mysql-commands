const {pool} = require('./mysql');
const ObjectId = require('./assets/ObjectId');

class Document{
    #preSave;
    #checkDb;
    #definition;
    #table;
    constructor({doc, definition, options, preSave, checkDb, table}){
        this.#preSave = preSave;
        this.#checkDb = checkDb;
        this.#definition = definition;
        this.#table = table;

        this.#convertData({doc, options});
    }
    #convertData = ({doc, options}) =>{
        const hasId = options.id === undefined || options.id?true:false;

        this.#definition.forEach((key)=>{
            let value = doc[key]?doc[key]:hasId && key === '_id'?ObjectId():'';

            this[key] = value;
        });
    }
    save(){
        try{
            let query = "INSERT INTO " + this.#table,
                cols = "",
                values = "";

            const insert = () =>{
                this.#definition.forEach((key, i)=>{
                    let value = pool.escape(this[key]);
    
                    cols += `${key}${i !== this.#definition.length - 1?', ':''}`;
                    values += `${value}${i !== this.#definition.length - 1?', ':''}`;
                });
                
                query += ` (${cols}) VALUES (${values})`;

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