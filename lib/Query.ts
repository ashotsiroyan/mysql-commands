import mysql from './mysql';
import Document from './Document';
import Model, {RootQuerySelector, FilterQuery} from './Model';
import {withOptions, getConditions, getFileds} from './plugins/functions';


type SortType = {
    [field: string]: -1 | 1;
}

export class DocumentQuery<T, DocType extends Document>{
    private conditions: RootQuerySelector | FilterQuery = {};
    private fields: string[] = [];
    private skipQuery: string = "";
    private sortQuery: any = "";
    private limitQuery: string = "";
    private isOne: boolean;
    private unionModels: {model: Model<Document>, isAll: boolean}[] = [];

    public readonly model: Model<DocType>;

    constructor(conditions: RootQuerySelector | FilterQuery, fields: string[], model: Model<DocType>, isOne?: boolean){
        this.conditions = conditions;
        this.fields = fields;
        this.isOne = isOne?isOne:false;

        this.model = model;
    }

    limit(val: number | string){
        if(val){
            this.limitQuery = " LIMIT " + val;
        }

        return this;
    }

    skip(val: number | string){
        if(val){
            this.skipQuery = " OFFSET " + val;
        }
        
        return this;
    }

    sort(arg: SortType){
        let keys = Object.keys(arg);

        if(keys.length > 0){
            let query = " ORDER BY ";

            keys.forEach((key: string | number, i)=>{
                query += `${key} ${arg[key] === -1?'DESC':'ASC'}${i !== keys.length - 1?', ':''}`;
            });

            this.sortQuery = query;
        }
        
        return this;
    }

    union(model: Model<DocType> | Model<DocType>[], all?: boolean){
        if(Array.isArray(model)){
            for(let i = 0; i < model.length; ++i){
                this.unionModels.push({
                    model: model[i],
                    isAll: all?true:false
                })
            }
            this.unionModels.concat();
        }else{
            this.unionModels.push({
                model: model,
                isAll: all?true:false
            })
        }
        
        return this;
    }

    exec(): Promise<T>
    exec(callback: (err: any, res?: T)=> void): void
    exec(callback?: (err: any, res?: T)=> void){
        try{
            let {conditions, fields, limitQuery, sortQuery, skipQuery, unionModels} = this;

            let _conditions = getConditions(conditions),
                _fields = getFileds(fields);
    
            let query = `SELECT ${_fields} FROM ${this.model.modelName} ${_conditions}`;

            unionModels.forEach((el)=>{
                query += ` UNION${el.isAll?' ALL':''} SELECT ${_fields} FROM ${el.model.modelName} ${_conditions}`;
            });
            
            query += sortQuery + limitQuery + (limitQuery.trim() !== ''?skipQuery:'');

            return mysql.execute(query, this.model.db.db)
                .then(([rows]: any[])=>{
                    rows = rows.map((row: any)=>{
                        return new Document({
                            doc: row,
                            ...this.model
                        });
                    });

                    let res: T;

                    if(!this.isOne)
                        res = rows;
                    else
                        res = rows[0]?rows[0]:null

                    if(callback)
                        callback(null, res);
                    else
                        return res;
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

export class Query{
    public readonly model: Model<any>;

    constructor(model: Model<any>){
        this.model = model;
    }

    update(doc: any){
        let query = `UPDATE ${this.model.modelName} SET `;

        for(let key in doc){
            let options = this.model.schema.obj[key];

            if(options){
                let value = withOptions(doc[key], options);
                doc[key] = value;
    
                value = mysql.escape(withOptions(value, options));
    
                query += `${key} = ${value}, `;
            }
        };

        if(Boolean(this.model.schema.options) && this.model.schema.options.timestamps)
            query += `_updatedAt = ${mysql.escape(new Date())}, `;

        if(query.slice(-2) === ', ')
            query = query.slice(0, -2);

        return query;
    }
}