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
exports.model = exports.Schema = exports.connect = void 0;
const mysql_1 = __importDefault(require("./mysql"));
const Model_1 = __importDefault(require("./Model"));
const Schema_1 = __importDefault(require("./Schema"));
exports.Schema = Schema_1.default;
function connect(params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mysql_1.default.connect(params);
            return true;
        }
        catch (err) {
            throw err;
        }
    });
}
exports.connect = connect;
function model(table, Schema) {
    return new Model_1.default(table, Schema);
}
exports.model = model;
