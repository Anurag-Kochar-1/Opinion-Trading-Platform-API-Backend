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
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());


const port = process.env.PORT || 3000;

app.get("/", (_, res: Response) => {
  res.json({ message: "API BACKEND 🎇" });
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

export { app }