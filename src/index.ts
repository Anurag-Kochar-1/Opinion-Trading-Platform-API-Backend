import express, { Response } from "express";
import cors from "cors";
import { userRouter } from "./routes/user";
import { orderRouter } from "./routes/order";
import { balanceRouter } from "./routes/balance";
import { symbolRouter } from "./routes/symbol";
import { resetRouter } from "./routes/reset-2";
import dotenv from "dotenv";
import { orderBookRouter } from "./routes/orderbook";
import { tradeRouter } from "./routes/trade";
import { onRampRouter } from "./routes/onramp";
import bodyParser from "body-parser";
import { adminRouter } from "./routes/admin";
import { errorLogger, requestLogger } from "./middlewares/request-logger";
import { logger } from "./config/logger";
import { STATUS_TYPE } from "./types";

dotenv.config();


const app = express();

app.use(cors({
  origin: ['https://proboo.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(bodyParser.json());
app.use(requestLogger);
app.use(errorLogger);

const port = process.env.PORT || 3000;

app.get("/", (_, res: Response) => {
  logger.info('Home route accessed');
  res.json({ message: "API BACKEND 🎇" });
});

app.get("/ping", (_, res: Response) => {
  logger.info('Ping route accessed');
  res.json({
    statusType: STATUS_TYPE.SUCCESS,
    statusMessage: "",
    statusCode: 200
  }).status(200);
});

app.use("/user", userRouter);
app.use("/order", orderRouter);
app.use("/orderbook", orderBookRouter);
app.use("/balance", balanceRouter);
app.use("/symbol", symbolRouter);
app.use("/trade", tradeRouter);
app.use("/onramp", onRampRouter);
app.use("/reset", resetRouter);
app.use("/admin", adminRouter);

app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}`);
});


export default app