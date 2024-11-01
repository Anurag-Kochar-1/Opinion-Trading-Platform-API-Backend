"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.requestLogger = void 0;
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = require("../config/logger");
const stream = {
    write: (message) => {
        logger_1.logger.info(message.trim());
    },
};
morgan_1.default.token('body', (req) => JSON.stringify(req.body));
const requestLogger = (0, morgan_1.default)(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :body', { stream });
exports.requestLogger = requestLogger;
const errorLogger = (err, req, res, next) => {
    logger_1.logger.error('Error:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
    });
    next(err);
};
exports.errorLogger = errorLogger;
//# sourceMappingURL=request-logger.js.map