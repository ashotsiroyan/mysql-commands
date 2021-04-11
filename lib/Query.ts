import mysql from './mysql';
import Document from './Document';
import Model from './Model';
import {withOptions} from './plugins/functions';


type SortType = {
    [field: string]: -1 | 1;
}

export class DocumentQuery<T, DocType extends Document>{
    private mainQuery: string = "";
    private skipQuery: string = "";
    private sortQuery: any = "";
    private limitQuery: string = "";
    private isOne: boolean;

    public readonly model: Model<DocType>;

    constructor(query: string, model: Model<DocType>, isOne?: boolean){
        this.mainQuery = query;
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
        if(Object.keys(arg).length > 0){
            let query = " ORDER BY ";

            Object.keys(arg).forEach((key: string | number, i)=>{
                query += `${key} ${arg[key] === -1?'DESC':'ASC'}${i !== Object.keys(arg).length - 1?', ':''}`;
            });

            this.sortQuery = query;
        }
        
        return this;
    }

    exec(): Promise<T>
    exec(callback: (err: any, res?: T)=> void): void
    exec(callback?: (err: any, res?: T)=> void){
        try{
            let {mainQuery, limitQuery, sortQuery, skipQuery} = this;
    
            let query = mainQuery + sortQuery + limitQuery + (limitQuery.trim() !== ''?skipQuery:'');

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

        Object.keys(doc).forEach((key)=>{
            let options = this.model.schema.obj[key];

            if(options){
                let value = withOptions(doc[key], options);
                doc[key] = value;
    
                value = mysql.escape(withOptions(value, options));
    
                query += `${key} = ${value}, `;
            }
        });

        if(this.model.schema.options.timestamps)
            query += `_updatedAt = ${mysql.escape(new Date())}, `;

        if(query.slice(-2) === ', ')
            query = query.slice(0, -2);

        return query;
    }
}