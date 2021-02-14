import mysql from './mysql';
import Document from './Document';
import {DocProps} from './Model';


type SortType = {
    [field: string]: -1 | 1
}

type FnName = 'find' | 'findOne' | 'findById';

class DocumentQuery<T, DocType extends Document>{
    private mainQuery: string = "";
    private skipQuery: string = "";
    private sortQuery: any = "";
    private limitQuery: string = "";

    private docProps: DocProps;
    private fnName: FnName;

    constructor(query: string, docProps: DocProps, fnName: FnName){
        this.mainQuery = query;
        this.docProps = docProps;
        this.fnName = fnName;
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
    exec(callback: (err: any, res?: T)=>void): void
    exec(callback?: (err: any, res?: T)=>void){
        let {mainQuery, limitQuery, sortQuery, skipQuery} = this;

        try{
            let query = mainQuery + sortQuery + limitQuery + (limitQuery.trim() !== ''?skipQuery:'');

            return this.checkDb(()=>{
                return mysql.execute(query)
                    .then(([rows]: any[])=>{
                        mainQuery = "";
                        limitQuery = "";
                        sortQuery = "";
                        skipQuery = "";

                        rows = rows.map((row: any)=>{
                            return new Document({
                                doc: row,
                                ...this.docProps
                            });
                        });

                        let res: T;

                        if(this.fnName === 'find')
                            res = rows;
                        else
                            res = rows[0]?rows[0]:null

                        if(callback)
                            callback(null, res);
                        else
                            return res;
                    })
                    .catch((err: any)=>{
                        throw err;
                    });
            });
        }catch(err){
            mainQuery = "";
            limitQuery = "";
            sortQuery = "";
            skipQuery = "";

            if(callback)
                callback(err);
            else
                throw err;
        }
    }

    private checkDb( next: ()=> any ){
        return mysql.execute(`CREATE TABLE IF NOT EXISTS ${this.docProps.table} (${this.docProps.schema.query})`)
            .then(()=>{
                return next();
            })
            .catch((err: any)=>{
                throw err;
            });
    }
}

export default DocumentQuery;