import mysql from './mysql';
import Document from './Document';
import {DocumentQuery, Query} from './Query';
import Schema from './Schema';
import Connection from './Connection';
import {getConditions, getFileds, withOptions} from './plugins/functions';


export type QuerySelector = {
    /** equal */
    $eq?: any;
    
    /** not equal */
    $ne?: any;
    
    /** greater than */
    $gt?: any;
    
    /** greater than or equal */
    $gte?: any;
    
    /** like */
    $in?: string | string[] | number | number[];
    
    /** not like */
    $nin?: string | string[] | number | number[];
    
    /** less than */
    $lt?: any;
    
    /** less than or equal */
    $lte?: any;
}

export type RootQuerySelector = {
    _id?: string;
    $or?: Array<FilterQuery>;
    $and?: Array<FilterQuery>;
}

export type FilterQuery = {
    [field: string]: QuerySelector | string | number;
}


interface IModel<T extends Document>{
    new: (doc?: any)=> T;

    find(conditions?: RootQuerySelector | FilterQuery, fields?: string[]): DocumentQuery<T[], T>;
    find(conditions: RootQuerySelector | FilterQuery, fields: string[], callback: (err: any, res?: T[])=> void): DocumentQuery<T[], T>;

    findOne(conditions?: RootQuerySelector | FilterQuery, fields?: string[]): DocumentQuery<T | null, T>;
    findOne(conditions: RootQuerySelector | FilterQuery, fields: string[], callback: (err: any, res?: T | null)=> void): DocumentQuery<T | null, T>;

    findById(id: string, fields?: string[]): DocumentQuery<T | null, T>;
    findById(id: string, fields: string[], callback: (err: any, res?: T | null)=> void): DocumentQuery<T | null, T>;

    insertOne(params: object): Promise<T>;
    insertOne(params: object, callback: (err: any, res?: T)=> void): void;

    insertMany(params: object[]): Promise<T[]>;
    insertMany(params: object[], callback: (err: any, res?: T[])=> void): void;

    updateOne(conditions: RootQuerySelector | FilterQuery, doc: any): Promise<any>;
    updateOne(conditions: RootQuerySelector | FilterQuery, doc: any, callback: (err: any, raw?: any)=> void): void;

    updateMany(conditions: RootQuerySelector | FilterQuery, doc: any): Promise<any>;
    updateMany(conditions: RootQuerySelector | FilterQuery, doc: any, callback: (err: any, raw?: any)=> void): void;

    deleteOne(conditions: RootQuerySelector | FilterQuery): Promise<void>;
    deleteOne(conditions: RootQuerySelector | FilterQuery, callback: (err: any)=> void): void;

    deleteMany(conditions: RootQuerySelector | FilterQuery): Promise<void>;
    deleteMany(conditions: RootQuerySelector | FilterQuery, callback: (err: any)=> void): void;

    findOneAndUpdate(conditions: RootQuerySelector | FilterQuery, update: any): Promise<T | null>;
    findOneAndUpdate(conditions: RootQuerySelector | FilterQuery, update: any, callback: (err: any, res: T | null)=> void): void;

    findByIdAndUpdate(id: string, update: any): Promise<T | null>;
    findByIdAndUpdate(id: string, update: any, callback: (err: any, res: T | null)=> void): void;

    findOneAndDelete(conditions: RootQuerySelector | FilterQuery): Promise<T | null>;
    findOneAndDelete(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: T | null)=> void): void;

    findByIdAndDelete(id: string): Promise<T | null>;
    findByIdAndDelete(id: string, callback: (err: any, res?: T | null)=> void): void;

    countDocuments(conditions: RootQuerySelector | FilterQuery): Promise<number>;
    countDocuments(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: number)=> void): void;
}

class Model<T extends Document> implements IModel<T>{
    public readonly schema: Schema;
    public readonly db: Connection;
    public readonly modelName: string;

    constructor(name: string, schema: Schema, db: Connection){
        this.schema = schema;
        this.db = db;
        this.modelName = name;
    }

    new(doc?: any){
        return new Document({
            doc,
            schema: this.schema,
            db: this.db,
            modelName: this.modelName,
            isNew: true
        }) as T;
    }

    find(callback?: (err: any, res?: T[])=> void): DocumentQuery<T[], T>
    find(conditions: RootQuerySelector | FilterQuery, callback?: (err: any, res?: T[])=> void): DocumentQuery<T[], T>
    find(conditions: RootQuerySelector | FilterQuery, fields?: string[], callback?: (err: any, res?: T[])=> void): DocumentQuery<T[], T>
    find(conditions?: any, fields?: any, callback?: any){
        if (typeof conditions === 'function') {
            callback = conditions;
            conditions = {};
            fields = null;
        } else if (typeof fields === 'function') {
            callback = fields;
            fields = null;
        }

        const query = new DocumentQuery<T[], T>(`SELECT ${getFileds(fields)} FROM ${this.modelName} ${getConditions(conditions)}`, this);

        if(callback)
            query.exec(callback);

        return query;
    }

    findOne(callback?: (err: any, res?: T | null)=> void): DocumentQuery<T | null, T>
    findOne(conditions: RootQuerySelector | FilterQuery, callback?: (err: any, res?: T | null)=> void): DocumentQuery<T | null, T>
    findOne(conditions: RootQuerySelector | FilterQuery, fields?: string[], callback?: (err: any, res?: T | null)=> void): DocumentQuery<T | null, T>
    findOne(conditions?: any, fields?: any, callback?: any){
        if (typeof conditions === 'function') {
            callback = conditions;
            conditions = {};
            fields = null;
        } else if (typeof fields === 'function') {
            callback = fields;
            fields = null;
        }

        const query = (new DocumentQuery<T | null, T>(`SELECT ${getFileds(fields)} FROM ${this.modelName} ${getConditions(conditions)}`, this, true)).limit(1);

        if(callback)
            query.exec(callback);

        return query;
    }

    findById(id: string, callback?: (err: any, res?: T | null)=> void): DocumentQuery<T | null, T>
    findById(id: string, fields?: string[], callback?: (err: any, res?: T | null)=> void): DocumentQuery<T | null, T>
    findById(id: any, fields?: any, callback?: any){
        if (typeof fields === 'function') {
            callback = fields;
            fields = null;
        }

        const query = (new DocumentQuery<T | null, T>(`SELECT ${getFileds(fields)} FROM ${this.modelName} WHERE _id = ${mysql.escape(id)}`, this, true)).limit(1);

        if(callback)
            query.exec(callback);

        return query;
    }

    insertOne(params: object): Promise<T>
    insertOne(params: object, callback: (err: any, res?: Document)=> void): void
    insertOne(params: object = {}, callback?: (err: any, res?: Document)=> void){
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

    insertMany(params: object[]): Promise<T[]>
    insertMany(params: object[], callback: (err: any, res?: T[])=> void): void
    insertMany(params: object[] = [], callback?: (err: any, res?: T[])=> void){
        try{
            let query = "INSERT INTO " + this.modelName,
                docs: T[] = params.map((doc)=>{
                    return this.new(doc);
                });

            const insertNext = () =>{       
                let keys = Object.keys(this.schema.obj),
                    values = "",
                    cols = "";

                docs.forEach((row, i)=>{
                    keys.forEach((key, j)=>{
                        let value = mysql.escape(withOptions(row[key], this.schema.obj[key]));
        
                        if(i === 0)
                            cols += `${key}${j !== keys.length - 1?', ':''}`;

                        values += `${j === 0?'(':''}${value}${j !== keys.length - 1?', ':i === params.length - 1?')':'), '}`;
                    });
                });
    
                query += ` (${cols}) VALUES ${values}`;
            }

            if(this.schema.preMethods.insertMany){
                this.schema.preMethods.insertMany.call(docs, insertNext);
            }else
                insertNext();


            return mysql.execute(query, this.db.db)
                .then(()=>{
                    if(callback)
                        callback(null, docs);
                    else
                        return docs;
                })
                .catch((err: any)=>{
                    if(callback)
                        callback(err);
                    else
                        throw err;
                });        
        }catch(err){
            if(callback)
                callback(err);
            else
                throw err;
        }
    }

    updateOne(conditions: RootQuerySelector | FilterQuery, doc: any): Promise<any>
    updateOne(conditions: RootQuerySelector | FilterQuery, doc: any, callback: (err: any, raw?: any)=> void): void
    updateOne(conditions: RootQuerySelector | FilterQuery, doc: any = {}, callback?: (err: any, raw?: any)=> void){
        try{
            if(Object.keys(doc).length > 0){
                let query: string = '';
                    
                const updateNext = () =>{
                    query = `${new Query(this).update(doc)} ${getConditions(conditions)} LIMIT 1`;
                }

                if(this.schema.preMethods.update)
                    this.schema.preMethods.update.call(doc, updateNext);
                else
                    updateNext();

    
                return mysql.execute(query, this.db.db)
                    .then(()=>{
                        if(callback)
                            callback(null, doc);
                        else
                            return doc;
                    })
                    .catch((err: any)=>{
                        if(callback)
                            callback(err);
                        else
                            throw err;
                    });
            }
            else{
                if(callback)
                    callback(null, doc);
                else
                    return doc;
            }
        }catch(err){
            if(callback)
                callback(err);
            else
                throw err;
        }
    }

    updateMany(conditions: RootQuerySelector | FilterQuery, doc: any): Promise<any>
    updateMany(conditions: RootQuerySelector | FilterQuery, doc: any, callback: (err: any, raw?: any)=> void): void
    updateMany(conditions: RootQuerySelector | FilterQuery, doc: any = {}, callback?: (err: any, raw?: any)=> void){
        try{
            let filterFileds = getConditions(conditions);

            if(filterFileds.trim() !== "" && Object.keys(doc).length > 0){
                let query: string = '';
                    
                const updateNext = () =>{
                    query = `${new Query(this).update(doc)} ${filterFileds}`;
                }

                if(this.schema.preMethods.update)
                    this.schema.preMethods.update.call(doc, updateNext);
                else
                    updateNext();
    
    
                return mysql.execute(query, this.db.db)
                    .then(()=>{
                        if(callback)
                            callback(null, doc);
                        else
                            return doc;
                    })
                    .catch((err: any)=>{
                        if(callback)
                            callback(err);
                        else
                            throw err;
                    });
            }else{
                if(callback)
                    callback(null, doc);
                else
                    return doc;
            }
        }catch(err){
            if(callback)
                callback(err);
            else
                throw err;
        }
    }

    deleteOne(conditions?: RootQuerySelector | FilterQuery): Promise<void>
    deleteOne(conditions: RootQuerySelector | FilterQuery, callback: (err: any)=> void): void
    deleteOne(conditions?: RootQuerySelector | FilterQuery, callback?: (err: any)=> void){
        try{
            let query = `DELETE FROM ${this.modelName} ${getConditions(conditions)} LIMIT 1`;


            return mysql.execute(query, this.db.db)
                .then(()=>{
                    if(callback)
                        callback(null);
                    else
                        return undefined;
                })
                .catch((err: any)=>{
                    if(callback)
                        callback(err);
                    else
                        throw err;
                });
        }catch(err){
            if(callback)
                callback(err);
            else
                throw err;
        }
    }

    deleteMany(conditions?: RootQuerySelector | FilterQuery): Promise<void>
    deleteMany(conditions: RootQuerySelector | FilterQuery, callback: (err: any)=> void): void
    deleteMany(conditions?: RootQuerySelector | FilterQuery, callback?: (err: any)=> void){
        try{
            let filterFileds = getConditions(conditions);

            if(filterFileds.trim() !== ""){
                let query = `DELETE FROM ${this.modelName} ${filterFileds}`;

    
                return mysql.execute(query, this.db.db)
                    .then(()=>{
                        if(callback)
                            callback(null);
                        else
                            return undefined;
                    })
                    .catch((err: any)=>{
                        if(callback)
                            callback(err);
                        else
                            throw err;
                    });
            }else{
                if(callback)
                    callback(null);
                else
                    return undefined;
            }
        }catch(err){
            if(callback)
                callback(err);
            else
                throw err;
        }
    }

    findOneAndUpdate(conditions: RootQuerySelector | FilterQuery, update: any): Promise<T | null>;
    findOneAndUpdate(conditions: RootQuerySelector | FilterQuery, update: any, callback: (err: any, res: T | null)=> void): void;
    async findOneAndUpdate(conditions: RootQuerySelector | FilterQuery, update: any, callback?: (err: any, res: T | null)=> void){
        try{
            let doc = await this.findOne(conditions).exec();

            if(doc && Object.keys(update).length > 0){
                let query: string = '';
                    
                const updateNext = () =>{
                    Object.keys(update).forEach((key)=>{
                        if(this.schema.obj[key]){
                            (doc as Document)[key] = update[key];
                        }
                    });

                    query = `${new Query(this).update(update)} ${getConditions(conditions)} LIMIT 1`;
                }

                if(this.schema.preMethods.findOneAndUpdate)
                    this.schema.preMethods.findOneAndUpdate.call(update, updateNext);
                else
                    updateNext();

    
                return mysql.execute(query, this.db.db)
                    .then(()=>{
                        if(callback)
                            callback(null, doc);
                        else
                            return doc;
                    })
                    .catch((err: any)=>{
                        if(callback)
                            callback(err, null);
                        else
                            throw err;
                    });
            }
            else{
                if(callback)
                    callback(null, doc);
                else
                    return doc;
            }
        }catch(err){
            if(callback)
                callback(err, null);
            else
                throw err;
        }
    }

    findByIdAndUpdate(id: string, update: any): Promise<T | null>;
    findByIdAndUpdate(id: string, update: any, callback: (err: any, res: T | null)=> void): void;
    async findByIdAndUpdate(id: string, update: any, callback?: (err: any, res: T | null)=> void){
        try{
            if(callback){
                this.findOneAndUpdate({_id: id}, update, callback);
            }else{
                return await this.findOneAndUpdate({_id: id}, update);
            }
        }catch(err){
            if(callback)
                callback(err, null);
            else
                throw err;
        }
    }

    findOneAndDelete(conditions: RootQuerySelector | FilterQuery): Promise<T | null>;
    findOneAndDelete(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res: T | null)=> void): void;
    async findOneAndDelete(conditions: RootQuerySelector | FilterQuery, callback?: (err: any, res: T | null)=> void){
        try{
            let doc = await this.findOne(conditions).exec();

            if(doc){
                let query: string = `DELETE FROM ${this.modelName}`;
                    
                const deleteNext = () =>{
                    query += ` ${getConditions(conditions)} LIMIT 1`;
                }

                if(this.schema.preMethods.findOneAndDelete)
                    this.schema.preMethods.findOneAndDelete.call(doc, deleteNext);
                else
                    deleteNext();

    
                return mysql.execute(query, this.db.db)
                    .then(()=>{
                        if(callback)
                            callback(null, doc);
                        else
                            return doc;
                    })
                    .catch((err: any)=>{
                        if(callback)
                            callback(err, null);
                        else
                            throw err;
                    });
            }
            else{
                if(callback)
                    callback(null, doc);
                else
                    return doc;
            }
        }catch(err){
            if(callback)
                callback(err, null);
            else
                throw err;
        }
    }

    findByIdAndDelete(id: string): Promise<T | null>;
    findByIdAndDelete(id: string, callback: (err: any, res: T | null)=> void): void;
    async findByIdAndDelete(id: string, callback?: (err: any, res: T | null)=> void){
        try{
            if(callback){
                this.findOneAndDelete({_id: id}, callback);
            }else{
                return await this.findOneAndDelete({_id: id});
            }
        }catch(err){
            if(callback)
                callback(err, null);
            else
                throw err;
        }
    }

    countDocuments(conditions?: RootQuerySelector | FilterQuery): Promise<number>
    countDocuments(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: number)=> void): void
    countDocuments(conditions?: RootQuerySelector | FilterQuery, callback?: (err: any, res?: number)=> void){
        try{
            let query = `SELECT COUNT(*) FROM ${this.modelName} ${getConditions(conditions)}`;
        

            return mysql.execute(query, this.db.db).then(([res]: any[])=>{
                let count = res[0]['COUNT(*)'];

                if(callback)
                    callback(null, count);
                else
                    return count;
            })
            .catch((err: any)=>{
                if(callback)
                    callback(err);
                else
                    throw err;
            });
        }catch(err){
            if(callback)
                callback(err);
            else
                throw err;
        }
    }
}

export default Model;