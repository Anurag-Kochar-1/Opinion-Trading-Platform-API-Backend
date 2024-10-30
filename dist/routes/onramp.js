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
exports.onRampRouter = void 0;
const express_1 = require("express");
const redis_manager_1 = require("../lib/redis-manager");
const types_1 = require("../types");
exports.onRampRouter = (0, express_1.Router)();
exports.onRampRouter.post("/inr", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId, amount } = req.body;
    if (!userId || !amount || amount <= 0) {
        res.status(400).json({ error: "Invalid input" });
        return;
    }
    const response = yield redis_manager_1.RedisManager.getInstance().sendAndAwait({
        type: types_1.REQUEST_TYPE.ONRAMP_USER_BALANCE,
        data: { userId, amount },
    });
    const parsedResponse = JSON.parse((_a = response === null || response === void 0 ? void 0 : response.payload) === null || _a === void 0 ? void 0 : _a.message);
    res.status(parsedResponse === null || parsedResponse === void 0 ? void 0 : parsedResponse.statusCode).json(parsedResponse);
}));
//# sourceMappingURL=onramp.js.map