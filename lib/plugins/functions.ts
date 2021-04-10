import mysql from '../mysql';
import {QuerySelector, RootQuerySelector, FilterQuery} from '../Model';
import {SchemaDefinition} from '../Schema';

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



export function getConditions(arg?: RootQuerySelector | FilterQuery) {
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
                                filterFileds += `${prevField} ${selectorActions[field as keyof QuerySelector]} ${mysql.escape(value)} ${field === '$nin'?'AND':'OR'} `;
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



export function getFileds(arg?: string[]){
    let showFileds = arg && arg.length > 0?"":"*";

    if(arg && arg.length > 0)
        arg.forEach((field: string, i: number)=>{
            showFileds += `${field}${i !== arg.length - 1?', ':''}`;
        });

    return showFileds;
}



export function withOptions(value: any, options: any){
    if(typeof value === 'string' && typeof options !== 'string'){
        let def = (options as SchemaDefinition);

        if(def.lowercase)
            value = value.toLowerCase();

        if(def.uppercase)
            value = value.toUpperCase();

        if(def.trim)
            value = value.trim();
    }

    return value;
}