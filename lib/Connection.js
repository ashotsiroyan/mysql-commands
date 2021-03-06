"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const Model_1 = __importDefault(require("./Model"));
const mysql_1 = __importDefault(require("./mysql"));
class Connection {
    constructor(props) {
        /** Returns models defined through this Connection */
        this.models = {};
        this.name = props && props.database ? props.database : '';
        this.db = props ? promise_1.default.createPool(props) : undefined;
    }
    /**  Switches to a different database using the same connection pool. */
    useDb(props) {
        this.name = props.database ? props.database : '';
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
        if (!this.models[name] && schema) {
            let model = new Model_1.default(name, schema, this);
            this.models[name] = model;
            return model;
        }
        else if (this.models[name] && !schema) {
            return this.models[name];
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
    dropTable(name, callback) {
        return mysql_1.default.execute(`DROP TABLE ${name}`, this.db)
            .then(() => {
            if (callback)
                callback(null);
            else
                return undefined;
        })
            .catch((err) => {
            if (callback)
                callback(err);
            else
                throw err;
        });
    }
    dropDatabase(callback) {
        return mysql_1.default.execute(`DROP DATABASE ${this.name}`, this.db)
            .then(() => {
            if (callback)
                callback(null);
            else
                return undefined;
        })
            .catch((err) => {
            if (callback)
                callback(err);
            else
                throw err;
        });
    }
    /** Closes the connection */
    close(callback) {
        if (this.db) {
            return this.db.end()
                .then(() => {
                if (callback)
                    callback(null);
                else
                    return undefined;
            })
                .catch((err) => {
                if (callback)
                    callback(err);
                else
                    throw err;
            });
        }
        else {
            if (callback)
                callback(null);
            else
                return undefined;
        }
    }
}
exports.default = Connection;
