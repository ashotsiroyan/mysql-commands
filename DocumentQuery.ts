import Document from './Document';
import {DocProps} from './Model';

type SortType = {
    [field: string]: -1 | 1
}

class DocumentQuery{
    private mainQuery: string = "";
    private skipQuery: string = "";
    private sortQuery: any = "";
    private limitQuery: string = "";
    private docProps: DocProps;
    private fnName: string;
    private dbQuery: ( next: (db: any)=> any )=> any;
    constructor(query: string, docProps: DocProps, fnName: string){
        this.mainQuery = query;
        this.dbQuery = docProps.dbQuery;
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

            return this.dbQuery((db: any)=>{
                return db.execute(query)
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
}

export default DocumentQuery;