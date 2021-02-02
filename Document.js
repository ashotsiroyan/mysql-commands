const mysql = require('./mysql');
const actions = require('./assets/actions');

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
                                filterFileds += `${prevField} ${actions[field]} ${mysql.getInstance().escape(value)} AND `;
                            });
                        }
                    }
                }else{
                    let value = params[field];
                    // if(typeof value === 'string')
                    //     value = "'" + value + "'";

                    if(field[0] === '$'){
                        filterFileds += `${prevField} ${actions[field]} ${mysql.getInstance().escape(value)}${i !== Object.keys(params).length - 1?' AND ':''}`;
                    }else{
                        filterFileds += `${field} = ${mysql.getInstance().escape(value)}${i !== Object.keys(params).length - 1?' AND ':''}`;
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

class Document{
    #table;
    #mysqlStructure;
    #definition;
    #query = {
        main: "",
        skip: "",
        sort: "",
        limit: "",
    };
    constructor(table, mysqlStructure, definition){
        this.#table = table;
        this.#mysqlStructure = mysqlStructure;
        this.#definition = definition;
    }
    find(_filterFileds, _showFileds){
        try{
            let query = "SELECT";

            query += ` ${getShowFileds(_showFileds)} FROM ${this.#table} ${getFilterFileds(_filterFileds)}`;
            this.#query.main = query;

            return this;
        }catch(err){
            throw err;
        }
    }
    findOne(_filterFileds, _showFileds){
        try{
            let query = "SELECT";

            query += ` ${getShowFileds(_showFileds)} FROM ${this.#table} ${getFilterFileds(_filterFileds)} LIMIT 1`;
            this.#query.main = query;

            return this.exec();
        }catch(err){
            throw err;
        }
    }
    findById(id, _showFileds){
        try{
            let query = "SELECT";

            query += ` ${getShowFileds(_showFileds)} FROM ${this.#table} WHERE id = ${mysql.getInstance().escape(id)} LIMIT 1`;
            this.#query.main = query;

            return this.exec();
        }catch(err){
            throw err;
        }
    }
    insertOne(params = {}){
        try{
            let query = "INSERT INTO " + this.#table,
                cols = "",
                values = "";
            
            Object.keys(params).forEach((key, i)=>{
                let value = mysql.getInstance().escape(params[key]);
                // if(typeof value === 'string')
                //     value = "'" + value + "'";

                cols += `${key}${i !== Object.keys(params).length - 1?', ':''}`;
                values += `${value}${i !== Object.keys(params).length - 1?', ':''}`;
            });
            
            query += ` (${cols}) VALUES (${values})`;

            return this.#checkDb(()=>{
                return mysql.getInstance().execute(query)
                    .then(()=>{
                        return true;
                    })
                    .catch((err)=>{
                        throw err;
                    });
            });
        }catch(err){
            throw err;
        }
    }
    insertMany(params = []){
        try{
            let query = "INSERT INTO " + this.#table,
                values = "",
                cols = "",
                checkCols = [];

            const exists = (key)=>{
                let isExists = false;

                checkCols.forEach((res)=>{
                    if(res === key){
                        isExists = true;

                        return true;
                    }
                })

                return isExists;
            }
            
            params.forEach((row, i)=>{
                Object.keys(row).forEach((key, j)=>{
                    if(!exists(key)){
                        cols += `${key}${j !== Object.keys(row).length - 1?', ':''}`;
                        
                        checkCols.push(key);
                    }
                });
            });
            
            params.forEach((row, i)=>{
                checkCols.forEach((key, j)=>{
                    let value = mysql.getInstance().escape(row[key] || '');

                    // if(typeof value === 'string')
                    //     value = "'" + value + "'";
    
                    values += `${j === 0?'(':''}${value}${j !== checkCols.length - 1?', ':i === params.length - 1?')':'), '}`;
                });
            });

            query += ` (${cols}) VALUES ${values}`;

            return this.#checkDb(()=>{
                return mysql.getInstance().execute(query)
                    .then(()=>{
                        return true;
                    })
                    .catch((err)=>{
                        throw err;
                    });
            });
        }catch(err){
            throw err;
        }
    }
    findAndUpdate(_filterFileds, update = {}){
        try{
            let filterFileds = getFilterFileds(_filterFileds);

            if(filterFileds.trim() !== "" && Object.keys(update).length > 0){
                let query = `UPDATE ${this.#table} SET`,
                    updateString = "";
                    
                Object.keys(update).forEach((key, i)=>{
                    let value = mysql.getInstance().escape(update[key]);

                    updateString += `${key} = ${value}${i !== Object.keys(update).length - 1?', ':''}`;
                });

                query += ` ${updateString} ${filterFileds}`;

                return this.#checkDb(()=>{
                    return mysql.getInstance().execute(query)
                        .then(()=>{
                            return true;
                        })
                        .catch((err)=>{
                            throw err;
                        });
                });
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
                let query = `UPDATE ${this.#table} SET`,
                    updateString = "";
                    
                Object.keys(update).forEach((key, i)=>{
                    let value = mysql.getInstance().escape(update[key]);

                    updateString += `${key} = ${value}${i !== Object.keys(update).length - 1?', ':''}`;
                });

                query += ` ${updateString} WHERE id = ${mysql.getInstance().escape(id)}`;

                return this.#checkDb(()=>{
                    return mysql.getInstance().execute(query)
                        .then(()=>{
                            return true;
                        })
                        .catch((err)=>{
                            throw err;
                        });
                });
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
                let query = `DELETE FROM ${this.#table} ${filterFileds}`;

                return this.#checkDb(()=>{
                    return mysql.getInstance().execute(query)
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
                let query = `DELETE FROM ${this.#table} WHERE id = ${mysql.getInstance().escape(id)}`;
                
                return this.#checkDb(()=>{
                    return mysql.getInstance().execute(query)
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
    countRows(_filterFileds){
        try{
            let query = `SELECT COUNT(*) FROM ${this.#table} ${getFilterFileds(_filterFileds)}`;
        
            
            return this.#checkDb(()=>{
                return mysql.getInstance().execute(query).then(([res])=>{
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
                return mysql.getInstance().execute(query)
                    .then(([rows])=>{
                        this.#query.main = {
                            main: "",
                            skip: "",
                            sort: "",
                            limit: ""
                        };
                        return rows;
                    })
                    .catch((err)=>{
                        throw err;
                    });
            });
        }else
            throw "Order Error: .find().exec()";
    }
    #checkDb = (next) => {
        return mysql.getInstance().execute(`CREATE TABLE IF NOT EXISTS ${this.#table} (${this.#mysqlStructure})`)
            .then(()=>{
                return next();
            })
            .catch((err)=>{
                throw err;
            });
    }
}

module.exports = Document;