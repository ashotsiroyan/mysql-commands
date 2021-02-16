import mysql from './mysql';
import Document, {WithOptions} from './Document';
import DocumentQuery from './DocumentQuery';
import Schema from './Schema';
import Connection from './Connection';


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
    _id?: string;
    $or?: Array<FilterQuery>;
    $and?: Array<FilterQuery>;
}

type FilterQuery = {
    [field: string]: QuerySelector | string | number;
}

export interface DocProps{
    schema: Schema;
    db: Connection;
    modelName: string;
}

interface IModel<T extends Document>{
    new: (doc?: any)=> Document;

    find(conditions?: RootQuerySelector | FilterQuery, fields?: string[]): DocumentQuery<T[], T>;
    find(conditions: RootQuerySelector | FilterQuery, fields: string[], callback: (err: any, res?: Document[])=> void): DocumentQuery<T[], T>;

    findOne(conditions?: RootQuerySelector | FilterQuery, fields?: string[]): DocumentQuery<T | null, T>;
    findOne(conditions: RootQuerySelector | FilterQuery, fields: string[], callback: (err: any, res?: Document)=> void): DocumentQuery<T | null, T>;

    findById(id: string, fields?: string[]): DocumentQuery<T | null, T>;
    findById(id: string, fields: string[], callback: (err: any, res?: Document)=> void): DocumentQuery<T | null, T>;

    insertOne(params: object): Promise<Document>;
    insertOne(params: object, callback: (err: any, res?: Document)=> void): void;

    insertMany(params: object[]): Promise<Document[]>;
    insertMany(params: object[], callback: (err: any, res?: Document[])=> void): void;

    updateOne(conditions: RootQuerySelector | FilterQuery, update: any): Promise<any>;
    updateOne(conditions: RootQuerySelector | FilterQuery, update: any, callback: (err: any, raw?: any)=> void): void;

    updateMany(conditions: RootQuerySelector | FilterQuery, update: any): Promise<any>;
    updateMany(conditions: RootQuerySelector | FilterQuery, update: any, callback: (err: any, raw?: any)=> void): void;

    deleteOne(conditions: RootQuerySelector | FilterQuery): Promise<void>;
    deleteOne(conditions: RootQuerySelector | FilterQuery, callback: (err: any)=> void): void;

    deleteMany(conditions: RootQuerySelector | FilterQuery): Promise<void>;
    deleteMany(conditions: RootQuerySelector | FilterQuery, callback: (err: any)=> void): void;

    // findOneAndUpdate(conditions: RootQuerySelector | FilterQuery, update: any): Promise<Document>;
    // findOneAndUpdate(conditions: RootQuerySelector | FilterQuery, update: any, callback: (err: any, res?: Document)=> void): void;

    // findByIdAndUpdate(id: string, update: any): Promise<Document>;
    // findByIdAndUpdate(id: string, update: any, callback: (err: any, res?: Document)=> void): void;

    // findOneAndDelete(conditions: RootQuerySelector | FilterQuery): Promise<Document>;
    // findOneAndDelete(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: Document)=> void): void;

    // findByIdAndDelete(id: string): Promise<Document>;
    // findByIdAndDelete(id: string, callback: (err: any, res?: Document)=> void): void;

    countDocuments(conditions: RootQuerySelector | FilterQuery): Promise<number>;
    countDocuments(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: number)=> void): void;
}

class Model<T extends Document> implements IModel<T>{
    private docProps: DocProps;
    public readonly schema: Schema;
    public readonly db: Connection;

    constructor(name: string, schema: Schema, db: Connection){
        this.schema = schema;
        this.db = db;

        this.docProps = {
            schema: this.schema,
            db: this.db,
            modelName: name
        }
    }

    get modelName(){
        return this.docProps.modelName;
    }

    new(doc?: any){
        return new Document({
            doc,
            ...this.docProps,
            isNew: true
        });
    }

    find(callback?: (err: any, res?: Document[])=> void): DocumentQuery<T[], T>
    find(conditions: RootQuerySelector | FilterQuery, callback?: (err: any, res?: Document[])=> void): DocumentQuery<T[], T>
    find(conditions: RootQuerySelector | FilterQuery, fields?: string[], callback?: (err: any, res?: Document[])=> void): DocumentQuery<T[], T>
    find(conditions?: any, fields?: any, callback?: any){
        if (typeof conditions === 'function') {
            callback = conditions;
            conditions = {};
            fields = null;
        } else if (typeof fields === 'function') {
            callback = fields;
            fields = null;
        }

        const query = new DocumentQuery<T[], T>(`SELECT ${getFileds(fields)} FROM ${this.modelName} ${getConditions(conditions)}`, this.docProps, 'find');

        if(callback)
            query.exec(callback);

        return query;
    }

    findOne(callback?: (err: any, res?: Document)=> void): DocumentQuery<T | null, T>
    findOne(conditions: RootQuerySelector | FilterQuery, callback?: (err: any, res?: Document)=> void): DocumentQuery<T | null, T>
    findOne(conditions: RootQuerySelector | FilterQuery, fields?: string[], callback?: (err: any, res?: Document)=> void): DocumentQuery<T | null, T>
    findOne(conditions?: any, fields?: any, callback?: any){
        if (typeof conditions === 'function') {
            callback = conditions;
            conditions = {};
            fields = null;
        } else if (typeof fields === 'function') {
            callback = fields;
            fields = null;
        }

        const query = new DocumentQuery<T | null, T>(`SELECT ${getFileds(fields)} FROM ${this.modelName} ${getConditions(conditions)} LIMIT 1`, this.docProps, 'findOne');

        if(callback)
            query.exec(callback);

        return query;
    }

    findById(id: string, callback?: (err: any, res?: Document)=> void): DocumentQuery<T | null, T>
    findById(id: string, fields?: string[], callback?: (err: any, res?: Document)=> void): DocumentQuery<T | null, T>
    findById(id: any, fields?: any, callback?: any){
        if (typeof fields === 'function') {
            callback = fields;
            fields = null;
        }

        const query = new DocumentQuery<T | null, T>(`SELECT ${getFileds(fields)} FROM ${this.modelName} WHERE _id = ${mysql.escape(id)} LIMIT 1`, this.docProps, 'findById');

        if(callback)
            query.exec(callback);

        return query;
    }

    insertOne(params: object): Promise<Document>
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

    insertMany(params: object[]): Promise<Document[]>
    insertMany(params: object[], callback: (err: any, res?: Document[])=> void): void
    insertMany(params: object[] = [], callback?: (err: any, res?: Document[])=> void){
        try{
            let query = "INSERT INTO " + this.modelName,
                docs: Document[] = params.map((doc)=>{
                    return this.new(doc);
                });

            const insertNext = () =>{       
                let keys = Object.keys(this.schema.obj),
                    values = "",
                    cols = "";

                docs.forEach((row, i)=>{
                    keys.forEach((key, j)=>{
                        let value = mysql.escape(WithOptions(row[key], this.schema.obj[key]));
        
                        if(i === 0)
                            cols += `${key}${j !== keys.length - 1?', ':''}`;

                        values += `${j === 0?'(':''}${value}${j !== keys.length - 1?', ':i === params.length - 1?')':'), '}`;
                    });
                });
    
                query += ` (${cols}) VALUES ${values}`;
            }

            if(this.schema.methods.insertMany){
                this.schema.methods.insertMany(docs, insertNext);
            }else
                insertNext();

            return this.checkDb(()=>{
                return mysql.execute(query, this.db.db)
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

    updateOne(conditions: RootQuerySelector | FilterQuery, update: any): Promise<any>
    updateOne(conditions: RootQuerySelector | FilterQuery, update: any, callback: (err: any, raw?: any)=> void): void
    updateOne(conditions: RootQuerySelector | FilterQuery, update: any = {}, callback?: (err: any, raw?: any)=> void){
        try{
            if(Object.keys(update).length > 0){
                let query = `UPDATE ${this.modelName} SET`;
                    
                const updateNext = () =>{
                    let updateString = "";

                    Object.keys(this.schema.obj).forEach((key)=>{
                        if(key !== '_id'){
                            let value = update[key];

                            if(this.schema.options.timestamps && key === '_updatedAt')
                                value = new Date();
        
                            if(value){
                                value = mysql.escape(WithOptions(value, this.schema.obj[key]));

                                updateString += `${key} = ${value}, `;
                            }
                        }
                    });

                    if(updateString.slice(-2) === ', ')
                        updateString = updateString.slice(0, -2);

                    query += ` ${updateString} ${getConditions(conditions)} LIMIT 1`;
                }

                if(this.schema.methods.update)
                    this.schema.methods.update(update, updateNext);
                else
                    updateNext();

                return this.checkDb(()=>{
                    return mysql.execute(query, this.db.db)
                        .then(()=>{
                            if(callback)
                                callback(null, update);
                            else
                                return update;
                        })
                        .catch((err: any)=>{
                            throw err;
                        });
                });
            }
            else{
                if(callback)
                    callback(null, update);
                else
                    return update;
            }
        }catch(err){
            if(callback)
                callback(err);
            else
                throw err;
        }
    }

    updateMany(conditions: RootQuerySelector | FilterQuery, update: any): Promise<any>
    updateMany(conditions: RootQuerySelector | FilterQuery, update: any, callback: (err: any, raw?: any)=> void): void
    updateMany(conditions: RootQuerySelector | FilterQuery, update: any = {}, callback?: (err: any, raw?: any)=> void){
        try{
            let filterFileds = getConditions(conditions);

            if(filterFileds.trim() !== "" && Object.keys(update).length > 0){
                let query = `UPDATE ${this.modelName} SET`;
                    
                const updateNext = () =>{
                    let updateString = "";

                    Object.keys(this.schema.obj).forEach((key)=>{
                        if(key !== '_id'){
                            let value = update[key];

                            if(this.schema.options.timestamps && key === '_updatedAt')
                                value = new Date();
        
                            if(value){
                                value = mysql.escape(WithOptions(value, this.schema.obj[key]));

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
                    return mysql.execute(query, this.db.db)
                        .then(()=>{
                            if(callback)
                                callback(null, update);
                            else
                                return update;
                        })
                        .catch((err: any)=>{
                            throw err;
                        });
                });
            }else{
                if(callback)
                    callback(null, update);
                else
                    return update;
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

            return this.checkDb(()=>{
                return mysql.execute(query, this.db.db)
                    .then(()=>{
                        if(callback)
                            callback(null);
                        else
                            return undefined;
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

    deleteMany(conditions?: RootQuerySelector | FilterQuery): Promise<void>
    deleteMany(conditions: RootQuerySelector | FilterQuery, callback: (err: any)=> void): void
    deleteMany(conditions?: RootQuerySelector | FilterQuery, callback?: (err: any)=> void){
        try{
            let filterFileds = getConditions(conditions);

            if(filterFileds.trim() !== ""){
                let query = `DELETE FROM ${this.modelName} ${filterFileds}`;

                return this.checkDb(()=>{
                    return mysql.execute(query, this.db.db)
                        .then(()=>{
                            if(callback)
                                callback(null);
                            else
                                return undefined;
                        })
                        .catch((err: any)=>{
                            throw err;
                        });
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

    countDocuments(conditions?: RootQuerySelector | FilterQuery): Promise<number>
    countDocuments(conditions: RootQuerySelector | FilterQuery, callback: (err: any, res?: number)=> void): void
    countDocuments(conditions?: RootQuerySelector | FilterQuery, callback?: (err: any, res?: number)=> void){
        try{
            let query = `SELECT COUNT(*) FROM ${this.modelName} ${getConditions(conditions)}`;
        
            return this.checkDb(()=>{
                return mysql.execute(query, this.db.db).then(([res]: any[])=>{
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
        return mysql.execute(`CREATE TABLE IF NOT EXISTS ${this.modelName} (${this.schema.query})`)
            .then(()=>{
                return next();
            })
            .catch((err: any)=>{
                throw err;
            });
    }
}

export default Model;