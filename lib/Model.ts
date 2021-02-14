import mysql from './mysql';
import Document from './Document';
import DocumentQuery from './DocumentQuery';
import Schema from './Schema';


function getConditions(arg?: RootQuerySelector | FilterQuery) {
    let filterFileds = "";

    const closer = ({params, prevField = null}: any) =>{
        if(params){
            Object.keys(params).forEach((field, i)=>{
                if(typeof params[field] === 'object'){
                    if(field === '$or' || field === '$and'){
                        params[field].forEach((option: any, j: number)=>{
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
                            params[field].forEach((value: any)=>{
                                filterFileds += `${prevField} ${selectorActions[field as keyof QuerySelector]} ${mysql.escape(value)} OR `;
                            });
                        }
                    }
                }else{
                    let value = params[field];

                    if(field[0] === '$'){
                        filterFileds += `${prevField} ${selectorActions[field as keyof QuerySelector]} ${mysql.escape(value)}${i !== Object.keys(params).length - 1?' AND ':''}`;
                    }else{
                        filterFileds += `${field} = ${mysql.escape(value)}${i !== Object.keys(params).length - 1?' AND ':''}`;
                    }
                }
            });
        }
    }

    closer({params: arg});

    if(filterFileds.slice(-5) === ' AND ')
        filterFileds = filterFileds.slice(0, -5);

    if(filterFileds.slice(-4) === ' OR ')
        filterFileds = filterFileds.slice(0, -4);

    if(filterFileds.trim() !== "")
        filterFileds = "WHERE " + filterFileds;

    return filterFileds;
}

function getFileds(arg?: string[]){
    let showFileds = arg && arg.length > 0?"":"*";

    if(arg && arg.length > 0)
        arg.forEach((field: string, i: number)=>{
            showFileds += `${field}${i !== arg.length - 1?', ':''}`;
        });

    return showFileds;
}

type QuerySelector = {
    $eq?: any;
    $gt?: any;
    $gte?: any;
    $in?: string | string[] | number | number[];
    $lt?: any;
    $lte?: any;
    $ne?: any;
    $nin?: string | string[] | number | number[];
}

const selectorActions: QuerySelector = {
    $lt: '<',
    $gt: '>',
    $lte: '<=',
    $gte: '>=',
    $eq: '=',
    $ne: '!=',
    $in: 'LIKE',
    $nin: 'NOT LIKE'
}

type RootQuerySelector = {
    $or?: Array<FilterQuery>;
    $and?: Array<FilterQuery>;
}

type FilterQuery = {
    [field: string]: QuerySelector | string | number
}

export interface DocProps{
    schema: Schema;
    table: string;
}

interface IModel<T extends Document>{
    new: (doc?: any)=> Document;

    find(conditions?: RootQuerySelector | FilterQuery, fields?: string[]): DocumentQuery<T[], T>;
    find(conditions: RootQuerySelector | FilterQuery, fields: string[], callback: (err: any, res?: Document[])=>void): DocumentQuery<T[], T>;

    findOne(conditions?: RootQuerySelector | FilterQuery, fields?: string[]): DocumentQuery<T | null, T>;
    findOne(conditions: RootQuerySelector | FilterQuery, fields: string[], callback: (err: any, res?: Document)=>void): DocumentQuery<T | null, T>;

    findById(id: string, fields?: string[]): DocumentQuery<T | null, T>;
    findById(id: string, fields: string[], callback: (err: any, res?: Document)=>void): DocumentQuery<T | null, T>;

    insertOne(params: object): Promise<Document>;
    insertOne(params: object, callback: (err: any, res?: Document)=>void): void;

    insertMany(params: object[]): Promise<Document[]>;
    insertMany(params: object[], callback: (err: any, res?: Document[])=>void): void;

    findAndUpdate(conditions: RootQuerySelector | FilterQuery, update: any): Promise<Document>;
    findAndUpdate(conditions: RootQuerySelector | FilterQuery, update: any, callback: (err: any, res?: Document)=>void): void;

    findByIdAndUpdate(id: string, update:any): Promise<Document>;
    findByIdAndUpdate(id: string, update:any, callback: (err: any, res?: Document)=>void): void;

    findAndDelete(conditions: RootQuerySelector | FilterQuery): Promise<Document>;
    findAndDelete(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: Document)=>void): void;

    findByIdAndDelete(id: string): Promise<Document>;
    findByIdAndDelete(id: string, callback: (err: any, res?: Document)=>void): void;

    countDocuments(conditions: RootQuerySelector | FilterQuery): Promise<number>;
    countDocuments(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: number)=>void): void;
}

class Model<T extends Document> implements IModel<T>{
    private docProps: DocProps;
    public readonly schema: Schema;

    constructor(table: string, Schema: Schema){
        this.schema = Schema;

        this.docProps = {
            schema: this.schema,
            table: table
        }
    }

    get tableName(){
        return this.docProps.table;
    }

    new(doc?: any){
        return new Document({
            doc,
            ...this.docProps,
            isNew: true
        });
    }

    find(callback?: (err: any, res?: Document[])=>void): DocumentQuery<T[], T>
    find(conditions: RootQuerySelector | FilterQuery, callback?: (err: any, res?: Document[])=>void): DocumentQuery<T[], T>
    find(conditions: RootQuerySelector | FilterQuery, fields?: string[], callback?: (err: any, res?: Document[])=>void): DocumentQuery<T[], T>
    find(conditions?: any, fields?: any, callback?: any){
        if (typeof conditions === 'function') {
            callback = conditions;
            conditions = {};
            fields = null;
        } else if (typeof fields === 'function') {
            callback = fields;
            fields = null;
        }

        const query = new DocumentQuery<T[], T>(`SELECT ${getFileds(fields)} FROM ${this.tableName} ${getConditions(conditions)}`, this.docProps, 'find');

        if(callback)
            query.exec(callback);

        return query;
    }

    findOne(callback?: (err: any, res?: Document)=>void): DocumentQuery<T | null, T>
    findOne(conditions: RootQuerySelector | FilterQuery, callback?: (err: any, res?: Document)=>void): DocumentQuery<T | null, T>
    findOne(conditions: RootQuerySelector | FilterQuery, fields?: string[], callback?: (err: any, res?: Document)=>void): DocumentQuery<T | null, T>
    findOne(conditions?: any, fields?: any, callback?: any){
        if (typeof conditions === 'function') {
            callback = conditions;
            conditions = {};
            fields = null;
        } else if (typeof fields === 'function') {
            callback = fields;
            fields = null;
        }

        const query = new DocumentQuery<T | null, T>(`SELECT ${getFileds(fields)} FROM ${this.tableName} ${getConditions(conditions)} LIMIT 1`, this.docProps, 'findOne');

        if(callback)
            query.exec(callback);

        return query;
    }

    findById(id: string, callback?: (err: any, res?: Document)=>void): DocumentQuery<T | null, T>
    findById(id: string, fields?: string[], callback?: (err: any, res?: Document)=>void): DocumentQuery<T | null, T>
    findById(id: any, fields?: any, callback?: any){
        if (typeof fields === 'function') {
            callback = fields;
            fields = null;
        }

        const query = new DocumentQuery<T | null, T>(`SELECT ${getFileds(fields)} FROM ${this.tableName} WHERE _id = ${mysql.escape(id)} LIMIT 1`, this.docProps, 'findById');

        if(callback)
            query.exec(callback);

        return query;
    }

    insertOne(params: object): Promise<Document>
    insertOne(params: object, callback: (err: any, res?: Document)=>void): void
    insertOne(params: object = {}, callback?: (err: any, res?: Document)=>void){
        try{
            const document = this.new(params);

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

    insertMany(params: object[]): Promise<Document[]>
    insertMany(params: object[], callback: (err: any, res?: Document[])=>void): void
    insertMany(params: object[] = [], callback?: (err: any, res?: Document[])=>void){
        try{
            let query = "INSERT INTO " + this.tableName,
                docs: Document[] = params.map((doc)=>{
                    return this.new(doc);
                });

            const insertNext = () =>{       
                let keys = Object.keys(this.schema.obj),
                    values = "",
                    cols = "";

                docs.forEach((row, i)=>{
                    keys.forEach((key, j)=>{
                        let value = mysql.escape(row[key]);
        
                        if(i === 0)
                            cols += `${key}${j !== keys.length - 1?', ':''}`;

                        values += `${j === 0?'(':''}${value}${j !== keys.length - 1?', ':i === params.length - 1?')':'), '}`;
                    });
                });
    
                query += ` (${cols}) VALUES ${values}`;
            }

            if(this.schema.methods.save){
                docs.forEach((doc, i)=>{
                    if(this.schema.methods.save)
                        this.schema.methods.save(doc, ()=>{if(i === docs.length - 1) insertNext();});
                });
            }else
                insertNext();

            return this.checkDb(()=>{
                return mysql.execute(query)
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

    findAndUpdate(conditions: RootQuerySelector | FilterQuery, update:any): Promise<Document>
    findAndUpdate(conditions: RootQuerySelector | FilterQuery, update:any, callback: (err: any, res?: Document)=>void): void
    findAndUpdate(conditions: RootQuerySelector | FilterQuery, update:any = {}, callback?: (err: any, res?: Document)=>void){
        try{
            let filterFileds = getConditions(conditions);

            if(filterFileds.trim() !== "" && Object.keys(update).length > 0){
                let query = `UPDATE ${this.tableName} SET`;
                    
                const updateNext = () =>{
                    let updateString = "";

                    Object.keys(this.schema.obj).forEach((key)=>{
                        if(key !== '_id' && key !== 'id'){
                            let value = update[key];

                            if(this.schema.options.timestamps && key === '_updatedAt')
                                value = new Date();
        
                            if(value){
                                value = mysql.escape(value);

                                updateString += `${key} = ${value}, `;
                            }
                        }
                    });

                    if(updateString.slice(-2) === ', ')
                        updateString = updateString.slice(0, -2);
    
                    query += ` ${updateString} ${filterFileds}`;
                }

                if(this.schema.methods.update)
                    this.schema.methods.update(update, updateNext);
                else
                    updateNext();
    
                return this.checkDb(()=>{
                    return mysql.execute(query)
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

    findByIdAndUpdate(id: string, update:any): Promise<Document>
    findByIdAndUpdate(id: string, update:any, callback: (err: any, res?: Document)=>void): void
    findByIdAndUpdate(id: string, update:any = {}, callback?: (err: any, res?: Document)=>void){
        try{
            if(id && Object.keys(update).length > 0){
                let query = `UPDATE ${this.tableName} SET`;
                    
                const updateNext = () =>{
                    let updateString = "";

                    Object.keys(this.schema.obj).forEach((key)=>{
                        if(key !== '_id' && key !== 'id'){
                            let value = update[key];

                            if(this.schema.options.timestamps && key === '_updatedAt')
                                value = new Date();
        
                            if(value){
                                value = mysql.escape(value);

                                updateString += `${key} = ${value}, `;
                            }
                        }
                    });

                    if(updateString.slice(-2) === ', ')
                        updateString = updateString.slice(0, -2);

                    query += ` ${updateString} WHERE _id = ${mysql.escape(id)}`;
                }

                if(this.schema.methods.update)
                    this.schema.methods.update(update, updateNext);
                else
                    updateNext();

                return this.checkDb(()=>{
                    return mysql.execute(query)
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

    findAndDelete(conditions?: RootQuerySelector | FilterQuery): Promise<Document>
    findAndDelete(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: Document)=>void): void
    findAndDelete(conditions?: RootQuerySelector | FilterQuery, callback?: (err: any, res?: Document)=>void){
        try{
            let filterFileds = getConditions(conditions);

            if(filterFileds.trim() !== ""){
                let query = `DELETE FROM ${this.tableName} ${filterFileds}`;
  
                const deleteNext = () =>{

                }

                if(this.schema.methods.delete)
                    this.schema.methods.delete(this, deleteNext);
                else
                    deleteNext();

                return this.checkDb(()=>{
                    return mysql.execute(query)
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

    findByIdAndDelete(id: string): Promise<Document>
    findByIdAndDelete(id: string, callback: (err: any, res?: Document)=>void): void
    findByIdAndDelete(id: string, callback?: (err: any, res?: Document)=>void){
        try{
            if(id){
                let query = `DELETE FROM ${this.tableName} WHERE _id = ${mysql.escape(id)}`;
                                
                const deleteNext = () =>{

                }

                if(this.schema.methods.delete)
                    this.schema.methods.delete(this, deleteNext);
                else
                    deleteNext();

                return this.checkDb(()=>{
                    return mysql.execute(query)
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

    countDocuments(conditions?: RootQuerySelector | FilterQuery): Promise<number>
    countDocuments(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: number)=>void): void
    countDocuments(conditions?: RootQuerySelector | FilterQuery, callback?: (err: any, res?: number)=>void){
        try{
            let query = `SELECT COUNT(*) FROM ${this.tableName} ${getConditions(conditions)}`;
        
            return this.checkDb(()=>{
                return mysql.execute(query).then(([res]: any[])=>{
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

    private checkDb( next: ()=> any ){
        return mysql.execute(`CREATE TABLE IF NOT EXISTS ${this.tableName} (${this.schema.query})`)
            .then(()=>{
                return next();
            })
            .catch((err: any)=>{
                throw err;
            });
    }
}

export default Model;