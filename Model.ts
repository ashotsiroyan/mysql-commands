import mysql from './mysql';
import actions from './plugins/actions';
import Document from './Document';
import {returnParams, SchemaDefinition, SchemaMethods, SchemaOptions} from './Schema';

const pool = mysql.pool;

function getConditions(arg:any) {
    let filterFileds = "";

    const closer = ({params, prevField = null}:any) =>{
        if(params){
            Object.keys(params).forEach((field, i)=>{
                if(typeof params[field] === 'object'){
                    if(field === '$or' || field === '$and'){
                        params[field].forEach((option:any, j:number)=>{
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
                            params[field].forEach((value:any)=>{
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

function getFileds(arg: any){
    let showFileds = arg && arg.length > 0?"":"*";

    if(arg && arg.length > 0)
        arg.forEach((field: any, i: number)=>{
            showFileds += `${field}${i !== arg.length - 1?', ':''}`;
        });

    return showFileds;
}


interface DocumentParams{
    schema: SchemaDefinition;
    options: SchemaOptions;
    preSave: ((params:any, next: ()=> void ) => void) | undefined;
    checkDb(next: ()=>any): any;
    table: string;
}

interface IModel{
    new: (doc?: any)=> Document;

    find(conditions?: object, fields?: any[]): this;
    find(conditions: object, fields: any[], callback: (err: any, res?: Document[])=>void): void;

    findOne(conditions?: object, fields?: any[]): this;
    findOne(conditions: object, fields: any[], callback: (err: any, res?: Document[])=>void): void;

    findById(id: string, fields?: any[]): this;
    findById(id: string, fields: any[], callback: (err: any, res?: Document[])=>void): void;

    insertOne(params: object): Document | Promise<Document>;
    insertOne(params: object, callback: (err: any, res?: Document)=>void): void;

    insertMany(params: any[]): Document[] | Promise<Document[]>;
    insertMany(params: any[], callback: (err: any, res?: Document[])=>void): void;

    findAndUpdate(conditions: object, update: any): Document | Promise<Document>;
    findAndUpdate(conditions: object, update: any, callback: (err: any, res?: Document)=>void): void;

    findByIdAndUpdate(id: string, update:any): Document | Promise<Document>;
    findByIdAndUpdate(id: string, update:any, callback: (err: any, res?: Document)=>void): void;

    findAndDelete(conditions: any): Document | Promise<Document>;
    findAndDelete(conditions: any, callback: (err: any, res?: Document)=>void): void;

    findByIdAndDelete(id: string): Document | Promise<Document>;
    findByIdAndDelete(id: string, callback: (err: any, res?: Document)=>void): void;

    limit(val: number | string): this | undefined;
    skip(val: number | string): this | undefined;
    sort(arg: any[]): this | undefined;

    countDocuments(conditions: object): number | Promise<number>;
    countDocuments(conditions: object, callback: (err: any, res?: number)=>void): void;

    exec(): Document[] | Promise<Document[]>;
    exec(callback: (err: any, res?: Document[])=>void): void;
}

class Model implements IModel{
    private mysqlStructure: string;
    private methods: SchemaMethods;
    private query: any = {
        main: "",
        skip: "",
        sort: "",
        limit: "",
        err: null
    };
    private documentParams: DocumentParams;
    constructor(table: string, SchemaParams: returnParams){
        this.mysqlStructure = SchemaParams.sqlString;
        this.methods = SchemaParams.methods;

        this.documentParams = {
            schema: SchemaParams.definition,
            options: SchemaParams.options,
            preSave: this.methods['save'],
            checkDb: this.checkDb.bind(this),
            table: table
        }
    }
    get schema(){
        return this.documentParams.schema;
    }
    get tableName(){
        return this.documentParams.table;
    }
    new(doc?: any){
        return new Document({
            doc,
            ...this.documentParams,
            isNew: true
        });
    }

    find(conditions?: object, fields?: any[]): this
    find(conditions: object, fields: any[], callback: (err: any, res?: Document[])=>void): void
    find(conditions?: object, fields?: any[], callback?: (err: any, res?: Document[])=>void){
        let query = "SELECT";

        query += ` ${getFileds(fields)} FROM ${this.tableName} ${getConditions(conditions)}`;
        this.query.main = query;

        if(callback)
            return this.exec(callback);

        return this as Model;
    }

    findOne(conditions?: object, fields?: any[]): this
    findOne(conditions: object, fields: any[], callback: (err: any, res?: Document[])=>void): void
    findOne(conditions?: object, fields?: any[], callback?: (err: any, res?: Document[])=>void){
        let query = "SELECT";

        query += ` ${getFileds(fields)} FROM ${this.tableName} ${getConditions(conditions)} LIMIT 1`;
        this.query.main = query;

        if(callback)
            return this.exec(callback);

        return this as Model;
    }

    findById(id: string, fields?: any[]): this
    findById(id: string, fields: any[], callback: (err: any, res?: Document[])=>void): void
    findById(id: string, fields?: any[], callback?: (err: any, res?: Document[])=>void){
        if(id){
            let query = "SELECT";
    
            query += ` ${getFileds(fields)} FROM ${this.tableName} WHERE _id = ${pool.escape(id)} LIMIT 1`;
            this.query.main = query;

            if(callback)
                return this.exec(callback);
    
            return this as Model;
        }else{
            this.query.err = "ID isn't filled."
        }
    }

    insertOne(params:object): Document | Promise<Document>
    insertOne(params:object, callback: (err: any, res?: Document)=>void): void
    insertOne(params:object = {}, callback?: (err: any, res?: Document)=>void){
        try{
            const document = new Document({
                doc: params,
                ...this.documentParams,
                isNew: true
            });

            if(callback)
                document.save(callback);
            else
                return document.save();
        }catch(err){
            if(callback)
                callback(err);
            else
                throw err;
        }
    }

    insertMany(params:any[]): Document[] | Promise<Document[]>
    insertMany(params:any[], callback: (err: any, res?: Document[])=>void): void
    insertMany(params:any[] = [], callback?: (err: any, res?: Document[])=>void){
        try{
            let query = "INSERT INTO " + this.tableName,
                docs: Document[] = params.map((doc)=>{
                    return new Document({
                        doc,
                        ...this.documentParams,
                        isNew: true
                    });
                });

            const insert = () =>{       
                let keys = Object.keys(this.schema),
                    values = "",
                    cols = "";

                docs.forEach((row, i)=>{
                    keys.forEach((key, j)=>{
                        let value = pool.escape(row[key]);
        
                        if(i === 0)
                            cols += `${key}, `;

                        values += `${j === 0?'(':''}${value}${j !== keys.length - 1?', ':i === params.length - 1?')':'), '}`;
                    });
                });
    
                query += ` (${cols.slice(0, -2)}) VALUES ${values}`;
            }

            if(this.methods.save !== undefined){
                docs.forEach((doc, i)=>{
                    if(this.methods.save !== undefined) {
                        this.methods.save(doc, ()=>{if(i === docs.length - 1) insert();});
                    }
                });
            }else
                insert();

            return this.checkDb(()=>{
                return pool.execute(query)
                    .then(()=>{
                        if(callback)
                            callback(null, docs);
                        else
                            return docs;
                    })
                    .catch((err: any)=>{
                        throw err;
                    });
            });                
        }catch(err){
            if(callback)
                callback(err);
            else
                throw err;
        }
    }

    findAndUpdate(conditions:object, update:any): Document | Promise<Document>
    findAndUpdate(conditions:object, update:any, callback: (err: any, res?: Document)=>void): void
    findAndUpdate(conditions:object, update:any = {}, callback?: (err: any, res?: Document)=>void){
        try{
            let filterFileds = getConditions(conditions);

            if(filterFileds.trim() !== "" && Object.keys(update).length > 0){
                let query = `UPDATE ${this.tableName} SET`;
                    
                const insert = () =>{
                    let updateString = "";

                    Object.keys(this.schema).forEach((key)=>{
                        if(key !== '_id' && key !== 'id'){
                            let value = update[key];

                            if(this.documentParams.options.timestamps && key === '_updatedAt')
                                value = new Date();
        
                            if(value){
                                value = pool.escape(value);

                                updateString += `${key} = ${value}, `;
                            }
                        }
                    });
    
                    query += ` ${updateString.slice(0, -2)} ${filterFileds}`;
                }

                if(this.methods.update)
                    this.methods.update(update, insert);
                else
                    insert();
    
                return this.checkDb(()=>{
                    return pool.execute(query)
                        .then(()=>{
                            if(callback)
                                callback(null);
                            else
                                return true;
                        })
                        .catch((err: any)=>{
                            throw err;
                        });
                });
            }else if(filterFileds.trim() === "")
                throw "Filter fileds aren't filled.";
            else if(Object.keys(update).length === 0)
                throw "Update fileds aren't filled.";
        }catch(err){
            if(callback)
                callback(err);
            else
                throw err;
        }
    }

    findByIdAndUpdate(id: string, update:any): Document | Promise<Document>
    findByIdAndUpdate(id: string, update:any, callback: (err: any, res?: Document)=>void): void
    findByIdAndUpdate(id: string, update:any = {}, callback?: (err: any, res?: Document)=>void){
        try{
            if(id && Object.keys(update).length > 0){
                let query = `UPDATE ${this.tableName} SET`;
                    
                const insert = () =>{
                    let updateString = "";

                    Object.keys(this.schema).forEach((key)=>{
                        if(key !== '_id' && key !== 'id'){
                            let value = update[key];

                            if(this.documentParams.options.timestamps && key === '_updatedAt')
                                value = new Date();
        
                            if(value){
                                value = pool.escape(value);

                                updateString += `${key} = ${value}, `;
                            }
                        }
                    });

                    query += ` ${updateString.slice(0, -2)} WHERE _id = ${pool.escape(id)}`;
                }

                if(this.methods.update)
                    this.methods.update(update, insert);
                else
                    insert();

                return this.checkDb(()=>{
                    return pool.execute(query)
                        .then(()=>{
                            if(callback)
                                callback(null);
                            else
                                return true;
                        })
                        .catch((err: any)=>{
                            throw err;
                        });
                });
            }else if(!id)
                throw "ID isn't filled."
            else if(Object.keys(update).length === 0)
                throw "Update fileds aren't filled.";
        }catch(err){
            if(callback)
                callback(err);
            else
                throw err;
        }
    }

    findAndDelete(conditions: any): Document | Promise<Document>
    findAndDelete(conditions: any, callback: (err: any, res?: Document)=>void): void
    findAndDelete(conditions: any, callback?: (err: any, res?: Document)=>void){
        try{
            let filterFileds = getConditions(conditions);

            if(filterFileds.trim() !== ""){
                let query = `DELETE FROM ${this.tableName} ${filterFileds}`;

                return this.checkDb(()=>{
                    return pool.execute(query)
                        .then(()=>{
                            if(callback)
                                callback(null);
                            else
                                return true;
                        })
                        .catch((err: any)=>{
                            throw err;
                        });
                });
            }else
                throw "Filter fileds aren't filled.";
        }catch(err){
            if(callback)
                callback(err);
            else
                throw err;
        }
    }

    findByIdAndDelete(id: string): Document | Promise<Document>
    findByIdAndDelete(id: string, callback: (err: any, res?: Document)=>void): void
    findByIdAndDelete(id: string, callback?: (err: any, res?: Document)=>void){
        try{
            if(id){
                let query = `DELETE FROM ${this.tableName} WHERE _id = ${pool.escape(id)}`;
                
                return this.checkDb(()=>{
                    return pool.execute(query)
                        .then(()=>{
                            if(callback)
                                callback(null);
                            else
                                return true;
                        })
                        .catch((err: any)=>{
                            throw err;
                        });
                });
            }
            else
                throw "ID isn't filled."
        }catch(err){
            if(callback)
                callback(err);
            else
                throw err;
        }
    }
    limit(val: number | string){
        if(this.query.main !== ""){
            if(val){
                this.query.limit = " LIMIT " + val;
            }
        }else
            this.query.err = "Order Error: .find().limit()";

        return this;
    }
    skip(val: number | string){
        if(this.query.main !== ""){
            if(val){
                this.query.skip = " OFFSET " + val;
            }
        }else
            this.query.err = "Order Error: .find().skip()";
        
        return this;
    }
    sort(arg: any){
        if(this.query.main !== ""){
            if(Object.keys(arg).length > 0){
                let query = " ORDER BY ";

                Object.keys(arg).forEach((key: string | number, i)=>{
                    query += `${key} ${arg[key] === -1?'DESC':'ASC'}${i !== Object.keys(arg).length - 1?', ':''}`;
                });

                this.query.sort = query;
            }
        }else
            this.query.err = "Order Error: .find().sort()";
        
        return this;
    }

    countDocuments(conditions?: object): number | Promise<number>
    countDocuments(conditions: object, callback: (err: any, res?: number)=>void): void
    countDocuments(conditions?: object, callback?: (err: any, res?: number)=>void){
        try{
            let query = `SELECT COUNT(*) FROM ${this.tableName} ${getConditions(conditions)}`;
        
            return this.checkDb(()=>{
                return pool.execute(query).then(([res]: any[])=>{
                    let count = res[0]['COUNT(*)'];

                    if(callback)
                        callback(null, count);
                    else
                        return count;
                });
            });
        }catch(err){
            if(callback)
                callback(err);
            else
                throw err;
        }
    }

    exec(): Document[] | Promise<Document[]>
    exec(callback: (err: any, res?: Document[])=>void): void
    exec(callback?: (err: any, res?: Document[])=>void){
        try{
            if(this.query.err)
                throw this.query.err;

            let {main, limit, sort, skip} = this.query;

            if(main !== ""){
                let query = main + sort + limit + (limit !== ''?skip:'');

                return this.checkDb(()=>{
                    return pool.execute(query)
                        .then(([rows]: any[])=>{
                            this.query = {
                                main: "",
                                skip: "",
                                sort: "",
                                limit: "",
                                err: null
                            };

                            let res: Document[] = rows.map((row: any[])=>{
                                return new Document({
                                    doc: row,
                                    ...this.documentParams,
                                    checkDb: this.checkDb.bind(this)
                                });
                            });
    
                            if(callback)
                                callback(null, res);
                            else
                                return res;
                        })
                        .catch((err: any)=>{
                            throw err;
                        });
                });
            }else{
                throw "Order Error: .find().exec()";
            }
        }catch(err){
            this.query = {
                main: "",
                skip: "",
                sort: "",
                limit: "",
                err: null
            };

            if(callback)
                callback(err);
            else
                throw err;
        }
    }
    private checkDb(next: ()=>any){
        return pool.execute(`CREATE TABLE IF NOT EXISTS ${this.tableName} (${this.mysqlStructure})`)
            .then(()=>{
                return next();
            })
            .catch((err: any)=>{
                throw err;
            });
    }
}

export default Model;