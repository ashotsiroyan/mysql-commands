import { RootQuerySelector, FilterQuery } from '../Model';
declare function getConditions(arg?: RootQuerySelector | FilterQuery): string;
declare function getFileds(arg?: string[]): string;
declare function withOptions(value: any, options: any): any;
declare function joinWithFields(separator: string, array: any[], fields: string[]): string;
export { getConditions, getFileds, withOptions, joinWithFields };
