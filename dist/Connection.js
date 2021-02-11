"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Model_1 = __importDefault(require("./Model"));
class Connection {
    constructor(db, dbName) {
        this.models = {};
        this.name = dbName ? dbName : '';
        this.db = db;
    }
    model(table, Schema) {
        let model = new Model_1.default(table, Schema, () => this);
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
}
exports.default = Connection;
