"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connections = exports.connection = exports.model = exports.Schema = exports.createConnection = exports.connect = void 0;
const mysql_1 = __importDefault(require("./mysql"));
const Model_1 = __importDefault(require("./Model"));
const Schema_1 = __importDefault(require("./Schema"));
exports.Schema = Schema_1.default;
function connect(params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield mysql_1.default.connect(params);
        }
        catch (err) {
            throw err;
        }
    });
}
exports.connect = connect;
function createConnection(params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield mysql_1.default.createConnection(params);
        }
        catch (err) {
            throw err;
        }
    });
}
exports.createConnection = createConnection;
function model(table, Schema) {
    let model = new Model_1.default(table, Schema);
    return model;
}
exports.model = model;
const connection = mysql_1.default.connection;
exports.connection = connection;
const connections = mysql_1.default.connections;
exports.connections = connections;
