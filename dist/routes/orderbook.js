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
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderBookRouter = void 0;
const express_1 = require("express");
const types_1 = require("../types");
const redis_manager_1 = require("../lib/redis-manager");
exports.orderBookRouter = (0, express_1.Router)();
exports.orderBookRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const response = yield redis_manager_1.RedisManager.getInstance().sendAndAwait({
        type: types_1.REQUEST_TYPE.VIEW_ORDERBOOK,
        data: {},
    });
    const parsedResponse = JSON.parse((_a = response === null || response === void 0 ? void 0 : response.payload) === null || _a === void 0 ? void 0 : _a.message);
    res.status(parsedResponse === null || parsedResponse === void 0 ? void 0 : parsedResponse.statusCode).json(parsedResponse);
}));
exports.orderBookRouter.get("/:stockSymbol", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { stockSymbol } = req.params;
    const response = yield redis_manager_1.RedisManager.getInstance().sendAndAwait({
        type: types_1.REQUEST_TYPE.GET_ORDERBOOK_BY_STOCK_SYMBOL,
        data: { stockSymbol },
    });
    const parsedResponse = JSON.parse((_a = response === null || response === void 0 ? void 0 : response.payload) === null || _a === void 0 ? void 0 : _a.message);
    res.status(parseInt(parsedResponse === null || parsedResponse === void 0 ? void 0 : parsedResponse.statusCode)).json(parsedResponse);
}));
//# sourceMappingURL=orderbook.js.map