const {pool} = require('./mysql');
const actions = require('./plugins/actions');
const ObjectId = require('./plugins/ObjectId');
const Document = require('./Document');

function getFilterFileds(arg) {
    let filterFileds = "";

    const closer = ({params, prevField = null}) =>{
        if(params){
            Object.keys(params).forEach((field, i)=>{
                if(typeof params[field] === 'object'){
                    if(field === '$or' || field === '$and'){
                        params[field].forEach((option, j)=>{
                            filterFileds += "(";
                            closer({params: option});
                            if(filterFileds.slice(-5) === ' AND ')
                                filterFileds = filterFileds.slice(0, -5);

                            filterFileds += `)${j !== params[field].length - 1?` ${field === '$or'?"OR": "AND"} `:""}`;
                        });
                    }else{
                        if(!Array.isArray(params[field])){
                            closer({params: params[field], prevField: field});
                        }
                        else if(field === '$in' || field === '$nin'){
                            params[field].forEach((value)=>{
                                filterFileds += `${prevField} ${actions[field]} ${pool.escape(value)} AND `;
                            });
                        }
                    }
                }else{
                    let value = params[field];
                    // if(typeof value === 'string')
                    //     value = "'" + value + "'";

                    if(field[0] === '$'){
                        filterFileds += `${prevField} ${actions[field]} ${pool.escape(value)}${i !== Object.keys(params).length - 1?' AND ':''}`;
                    }else{
                        filterFileds += `${field} = ${pool.escape(value)}${i !== Object.keys(params).length - 1?' AND ':''}`;
                    }
                }
            });
        }
    }

    closer({params: arg});

    if(filterFileds.slice(-5) === ' AND ')
        filterFileds = filterFileds.slice(0, -5);


    if(filterFileds.trim() !== "")
        filterFileds = "WHERE " + filterFileds;

    return filterFileds;
}

function getShowFileds(arg){
    let showFileds = arg && arg.length > 0?"":"*";

    if(arg && arg.length > 0)
        arg.forEach((field, i)=>{
            showFileds += `${field}${i !== arg.length - 1?', ':''}`;
        });

    return showFileds;
}

class Model{
    #mysqlStructure;
    #methods;
    #query = {
        main: "",
        skip: "",
        sort: "",
        limit: "",
    };
    #documentParams = {}
    constructor(table, SchemaParams){
        this.#mysqlStructure = SchemaParams.sqlString;
        this.#methods = SchemaParams.methods;

        this.#documentParams = {
            schema: SchemaParams.definition,
            options: SchemaParams.options,
            preSave: this.#methods.save,
            table: table
        }
    }
    get schema(){
        return this.#documentParams.schema;
    }
    get tableName(){
        return this.#documentParams.table;
    }
    new(doc = {}){
        return new Document({
            doc,
            ...this.#documentParams,
            checkDb: this.#checkDb,
            isNew: true
        });
    }
    find(_filterFileds, _showFileds){
        try{
            let query = "SELECT";

            query += ` ${getShowFileds(_showFileds)} FROM ${this.tableName} ${getFilterFileds(_filterFileds)}`;
            this.#query.main = query;

            return this;
        }catch(err){
            throw err;
        }
    }
    findOne(_filterFileds, _showFileds){
        try{
            let query = "SELECT";

            query += ` ${getShowFileds(_showFileds)} FROM ${this.tableName} ${getFilterFileds(_filterFileds)} LIMIT 1`;
            this.#query.main = query;

            return this.exec();
        }catch(err){
            throw err;
        }
    }
    findById(id, _showFileds){
        try{
            let query = "SELECT";

            query += ` ${getShowFileds(_showFileds)} FROM ${this.tableName} WHERE _id = ${pool.escape(id)} LIMIT 1`;
            this.#query.main = query;

            return this.exec();
        }catch(err){
            throw err;
        }
    }
    insertOne(params = {}){
        try{
            const document = new Document({
                doc: params,
                ...this.#documentParams,
                checkDb: this.#checkDb,
                isNew: true
            });

            return document.save();
        }catch(err){
            throw err;
        }
    }
    insertMany(params = []){
        try{
            let query = "INSERT INTO " + this.tableName,
                values = "",
                cols = "";

            const hasId = this.#documentParams.options._id === undefined || this.#documentParams.options._id?true:false;

            const insert = () =>{       
                let keys = Object.keys(this.schema);         
                params.forEach((row, i)=>{
                    keys.forEach((key, j)=>{
                        let defaultValue = this.schema[key].default;
                        let value = pool.escape(row[key]?row[key]:defaultValue?defaultValue:key === '_id' && hasId?ObjectId():'');
        
                        if(i === 0)
                            cols += `${key}${j !== keys.length - 1?', ':''}`;

                        values += `${j === 0?'(':''}${value}${j !== keys.length - 1?', ':i === params.length - 1?')':'), '}`;
                    });
                });
    
                query += ` (${cols}) VALUES ${values}`;
    
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

            if(this.#methods.save){
                params.forEach((obj, i)=>{
                    this.#methods.save(obj, ()=>{if(i === params.length - 1) insert();});
                });
            }else
                insert();
        }catch(err){
            throw err;
        }
    }
    findAndUpdate(_filterFileds, update = {}){
        try{
            let filterFileds = getFilterFileds(_filterFileds);

            if(filterFileds.trim() !== "" && Object.keys(update).length > 0){
                let query = `UPDATE ${this.tableName} SET`,
                    updateString = "";
                    
                const insert = () =>{
                    Object.keys(update).forEach((key, i)=>{
                        let value = pool.escape(update[key]);
    
                        updateString += `${key} = ${value}${i !== Object.keys(update).length - 1?', ':''}`;
                    });
    
                    query += ` ${updateString} ${filterFileds}`;
    
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

                if(this.#methods.update)
                    this.#methods.update(update, insert);
                else
                    insert();
            }else if(filterFileds.trim() === "")
                throw "Filter fileds aren't filled.";
            else if(Object.keys(update).length === 0)
                throw "Update fileds aren't filled.";
        }catch(err){
            throw err;
        }
    }
    findByIdAndUpdate(id, update = {}){
        try{
            if(id && Object.keys(update).length > 0){
                let query = `UPDATE ${this.tableName} SET`,
                    updateString = "";
                    
                const insert = () =>{
                    Object.keys(update).forEach((key, i)=>{
                        let value = pool.escape(update[key]);
    
                        updateString += `${key} = ${value}${i !== Object.keys(update).length - 1?', ':''}`;
                    });
    
                    query += ` ${updateString} WHERE _id = ${pool.escape(id)}`;
    
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

                if(this.#methods.update)
                    this.#methods.update(update, insert);
                else
                    insert();
            }else if(!id)
                throw "ID isn't filled."
            else if(Object.keys(update).length === 0)
                throw "Update fileds aren't filled.";
        }catch(err){
            throw err;
        }
    }
    findAndDelete(_filterFileds){
        try{
            let filterFileds = getFilterFileds(_filterFileds);

            if(filterFileds.trim() !== ""){
                let query = `DELETE FROM ${this.tableName} ${filterFileds}`;

                return this.#checkDb(()=>{
                    return pool.execute(query)
                        .then(()=>{
                            return true;
                        })
                        .catch((err)=>{
                            throw err;
                        });
                });
            }else
                throw "Filter fileds aren't filled.";
        }catch(err){
            throw err;
        }
    }
    findByIdAndDelete(id){
        try{
            if(id){
                let query = `DELETE FROM ${this.tableName} WHERE _id = ${pool.escape(id)}`;
                
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
            else
                throw "ID isn't filled."
        }catch(err){
            throw err;
        }
    }
    limit(val){
        if(this.#query.main !== ""){
            if(val){
                this.#query.limit = " LIMIT " + val;
            }
        }else
            throw "Order Error: .find().limit()";

        return this;
    }
    skip(val){
        if(this.#query.main !== ""){
            if(val){
                this.#query.skip = " OFFSET " + val;
            }
        }else
            throw "Order Error: .find().skip()";
        
        return this;
    }
    sort(arg){
        if(this.#query.main !== ""){
            if(Object.keys(arg).length > 0){
                let query = " ORDER BY ";

                Object.keys(arg).forEach((key, i)=>{
                    query += `${key} ${arg[key] === -1?'DESC':'ASC'}${i !== Object.keys(arg).length - 1?', ':''}`;
                });

                this.#query.sort = query;
            }
        }else
            throw "Order Error: .find().sort()";
        
        return this;
    
    }
    countDocuments(_filterFileds){
        try{
            let query = `SELECT COUNT(*) FROM ${this.tableName} ${getFilterFileds(_filterFileds)}`;
        
            
            return this.#checkDb(()=>{
                return pool.execute(query).then(([res])=>{
                    return res[0]['COUNT(*)'];
                });
            });
        }catch(err){
            throw err;
        }
    }
    exec(){
        let {main, limit, sort, skip} = this.#query;

        if(main !== ""){
            let query = main + sort + limit + (limit !== ''?skip:'');

            return this.#checkDb(()=>{
                return pool.execute(query)
                    .then(([rows])=>{
                        this.#query.main = {
                            main: "",
                            skip: "",
                            sort: "",
                            limit: ""
                        };

                        return rows.map((row)=>{
                            return new Document({
                                doc: row,
                                ...this.#documentParams,
                                checkDb: this.#checkDb
                            });
                        });
                    })
                    .catch((err)=>{
                        throw err;
                    });
            });
        }else
            throw "Order Error: .find().exec()";
    }
    #checkDb = (next) => {
        return pool.execute(`CREATE TABLE IF NOT EXISTS ${this.tableName} (${this.#mysqlStructure})`)
            .then(()=>{
                return next();
            })
            .catch((err)=>{
                throw err;
            });
    }
}

module.exports = Model;