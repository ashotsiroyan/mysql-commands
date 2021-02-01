const mysql = require('./mysql');

const actions = {
    $lt: '<',
    $gt: '>',
    $lte: '<=',
    $gte: '>=',
    $eq: '=',
    $ne: '!=',
    $in: 'LIKE',
    $nin: 'NOT LIKE'
}

function getFilterFileds(_filterFileds){
    let filterFileds = "";

    if(_filterFileds){
        Object.keys(_filterFileds).forEach((field, i)=>{
            if(typeof _filterFileds[field] === 'object'){
                let withActions = '';

                if(field === '$or' || field === '$and'){
                    _filterFileds[field].forEach((option, k)=>{
                        Object.keys(option).forEach((subField, j)=>{                         
                            if(typeof option[subField] === 'object'){
                                Object.keys(option[subField]).forEach((action, p)=>{
                                    let value = option[subField][action];
                                    // if(typeof value === 'string')
                                    //     value = "'" + value + "'";

                                    withActions += `${subField} ${actions[action]} ${mysql.getInstance().escape(value)}${p !== Object.keys(option[subField]).length - 1?' AND ':''}`
                                });
                            }else {
                                let value = option[subField];
                                // if(typeof value === 'string')
                                //     value = "'" + value + "'";

                                withActions += `${subField} = ${mysql.getInstance().escape(value)}${j !== Object.keys(option).length - 1?' AND ':''}`;
                            }
                        });
                        
                        if(k === 1)
                            withActions = "(" + withActions;

                        withActions += k !== Object.keys(_filterFileds[field]).length - 1?field === '$or'?') OR (':') AND (':')';
                    });
                }else{
                    Object.keys(_filterFileds[field]).forEach((action, j)=>{
                        let value = _filterFileds[field][action];
                        // if(typeof value === 'string')
                        //     value = "'" + value + "'";

                        withActions += `${field} ${actions[action]} ${mysql.getInstance().escape(value)}${j !== Object.keys(_filterFileds[field]).length - 1?' AND ':''}`
                    });
                }

                filterFileds += `${withActions}${i !== Object.keys(_filterFileds).length - 1?' AND ':''}`;
            }else{
                let value = _filterFileds[field];
                // if(typeof value === 'string')
                //     value = "'" + value + "'";

                filterFileds += `${field} = ${mysql.getInstance().escape(value)}${i !== Object.keys(_filterFileds).length - 1?' AND ':''}`;
            }
        });

        if(filterFileds.trim() !== "")
            filterFileds = "WHERE " + filterFileds;
    }

    return filterFileds;
}

function getShowFileds(_showFileds){
    let showFileds = _showFileds && _showFileds.length > 0?"":"*";

    if(_showFileds && _showFileds.length > 0)
        _showFileds.forEach((field, i)=>{
            showFileds += `${field}${i !== _showFileds.length - 1?', ':''}`;
        });

    return showFileds;
}

class Schema{
    #table;
    #query = {
        main: "",
        skip: "",
        sort: "",
        limit: "",
    };
    constructor(table){
        this.#table = table;
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

            mysql.getInstance().execute(query);

            return true;
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

            mysql.getInstance().execute(query);

            return true;
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

                mysql.getInstance().execute(query);
    
                return true;
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

                mysql.getInstance().execute(query);
    
                return true;
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

                mysql.getInstance().execute(query);
    
                return true;
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

                mysql.getInstance().execute(query);
    
                return true;
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
        
            return mysql.getInstance().execute(query).then(([res])=>{
                return res[0]['COUNT(*)'];
            });
        }catch(err){
            throw err;
        }
    }
    exec(){
        let {main, limit, sort, skip} = this.#query;

        if(main !== ""){
            let query = main + sort + limit + (limit !== ''?skip:'');

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
        }else
            throw "Order Error: .find().exec()";
        
    }
}

module.exports = Schema;