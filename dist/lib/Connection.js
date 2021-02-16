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
     * @param name model and mysql db table name
     * @param schema a schema. necessary when defining a model
     * @returns The compiled model
     */
    model(name, schema) {
        if (!this.models[name]) {
            let model = new Model_1.default(name, schema, this);
            this.models[name] = model;
            return model;
        }
        else {
            throw `The model '${name}' already exists`;
        }
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
