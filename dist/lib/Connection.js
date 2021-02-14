"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const Model_1 = __importDefault(require("./Model"));
class Connection {
    constructor(props) {
        this.models = {};
        this.name = props ? props.database : '';
        this.db = props ? promise_1.default.createPool(props) : undefined;
    }
    /**  Switches to a different database using the same connection pool. */
    useDb(props) {
        this.name = props.database;
        this.db = promise_1.default.createPool(props);
        return this;
    }
    /**
     * Defines or retrieves a model.
     * @param table the mysql db table name and the model name
     * @param schema a schema. necessary when defining a model
     * @returns The compiled model
     */
    model(table, Schema) {
        let model = new Model_1.default(table, Schema, this);
        this.models[table] = model;
        return model;
    }
    modelNames() {
        return Object.keys(this.models);
    }
    deleteModel(model) {
        delete this.models[model];
        return this;
    }
    /** Closes the connection */
    close(callback) {
        if (this.db) {
            this.db.end()
                .then(() => {
                if (callback)
                    callback(null);
            })
                .catch((err) => {
                if (callback)
                    callback(err);
                else
                    throw err;
            });
        }
    }
}
exports.default = Connection;
