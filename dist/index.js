"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_1 = require("./routes/user");
const order_1 = require("./routes/order");
const balance_1 = require("./routes/balance");
const symbol_1 = require("./routes/symbol");
const reset_2_1 = require("./routes/reset-2");
const dotenv_1 = __importDefault(require("dotenv"));
const orderbook_1 = require("./routes/orderbook");
const trade_1 = require("./routes/trade");
const onramp_1 = require("./routes/onramp");
const body_parser_1 = __importDefault(require("body-parser"));
const admin_1 = require("./routes/admin");
const request_logger_1 = require("./middlewares/request-logger");
const logger_1 = require("./config/logger");
const types_1 = require("./types");
dotenv_1.default.config();
const app = (0, express_1.default)();
// app.use(cors({
//   origin: ['https://proboo.vercel.app', 'http://localhost:3000'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
// }));
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(request_logger_1.requestLogger);
app.use(request_logger_1.errorLogger);
const port = process.env.PORT || 3000;
app.get("/", (_, res) => {
    logger_1.logger.info('Home route accessed');
    res.json({ message: "API BACKEND 🎇" });
});
app.get("/ping", (_, res) => {
    logger_1.logger.info('Ping route accessed');
    res.json({
        statusType: types_1.STATUS_TYPE.SUCCESS,
        statusMessage: "",
        statusCode: 200
    }).status(200);
});
app.use("/user", user_1.userRouter);
app.use("/order", order_1.orderRouter);
app.use("/orderbook", orderbook_1.orderBookRouter);
app.use("/balance", balance_1.balanceRouter);
app.use("/symbol", symbol_1.symbolRouter);
app.use("/trade", trade_1.tradeRouter);
app.use("/onramp", onramp_1.onRampRouter);
app.use("/reset", reset_2_1.resetRouter);
app.use("/admin", admin_1.adminRouter);
app.listen(port, () => {
    console.log(`The server is running at http://localhost:${port}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map