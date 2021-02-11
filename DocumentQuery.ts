import mysql from './mysql';
import Document from './Document';
import {DocProps} from './Model';

const pool = mysql.pool;

type SortType = {
    [field: string]: -1 | 1
}

type FunName = 'find' | 'findOne' | 'findById';

class DocumentQuery{
    private mainQuery: string = "";
    private skipQuery: string = "";
    private sortQuery: any = "";
    private limitQuery: string = "";

    private docProps: DocProps;
    private fnName: FunName;

    constructor(query: string, docProps: DocProps, fnName: FunName){
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

    exec(): Promise<Document>
    exec(callback: (err: any, res?: Document)=>void): void
    exec(callback?: (err: any, res?: Document)=>void){
        let {mainQuery, limitQuery, sortQuery, skipQuery} = this;

        try{
            let query = mainQuery + sortQuery + limitQuery + (limitQuery.trim() !== ''?skipQuery:'');

            return this.checkDb(()=>{
                return pool.execute(query)
                    .then(([rows]: any[])=>{
                        mainQuery = "";
                        limitQuery = "";
                        sortQuery = "";
                        skipQuery = "";

                        let res: Document = rows.map((row: any[])=>{
                            return new Document({
                                doc: row,
                                ...this.docProps
                            });
                        });

                        if(this.fnName === 'findOne' || this.fnName === 'findById')
                            res = res[0];

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
        return pool.execute(`CREATE TABLE IF NOT EXISTS ${this.docProps.table} (${this.docProps.schema.query})`)
            .then(()=>{
                return next();
            })
            .catch((err: any)=>{
                throw err;
            });
    }
}

export default DocumentQuery;