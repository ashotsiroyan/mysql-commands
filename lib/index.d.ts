import { connectionParams } from './mysql';
import Model from './Model';
import Schema from './Schema';
import Document from './Document';
declare function connect(params: connectionParams): Promise<boolean>;
declare function model<T extends Document>(table: string, Schema: Schema): Model<T>;
export { connect, Schema, model };
