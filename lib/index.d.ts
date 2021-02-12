import { connectionParams } from './mysql';
import Model from './Model';
import Schema from './Schema';
declare function connect(params: connectionParams): Promise<boolean>;
declare function model(table: string, Schema: Schema): Model;
export { connect, Schema, model };
