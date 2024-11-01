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
exports.adminRouter = void 0;
const express_1 = require("express");
const redis_manager_1 = require("../lib/redis-manager");
const types_1 = require("../types");
const admin_middleware_1 = require("../middlewares/admin.middleware");
exports.adminRouter = (0, express_1.Router)();
exports.adminRouter.post("/crash", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    redis_manager_1.RedisManager.getInstance().sendAndAwait({
        type: types_1.REQUEST_TYPE.CRASH_SERVER,
        data: {},
    });
    res.status(200).json({ message: "Server Crash Request Sent!" });
}));
exports.adminRouter.post("/restore-server-state", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    redis_manager_1.RedisManager.getInstance().sendAndAwait({
        type: types_1.REQUEST_TYPE.RESTORE_SERVER_STATE,
        data: {},
    });
    res.status(200).json({ message: "Restore Server State Request Sent!" });
}));
//# sourceMappingURL=admin.js.map