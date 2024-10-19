import express, { Response } from "express";
import cors from "cors";
import { userRouter } from "./routes/user";
import { orderRouter } from "./routes/order";
import { balanceRouter } from "./routes/balance";
import { symbolRouter } from "./routes/symbol";
import { resetRouter } from "./routes/reset-2";

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

app.get("/", (_, res: Response) => {
  res.json({ message: "YEEEEEEEEEEHAWWWWWWWWWW" });
});

app.use("/user", userRouter);
app.use("/order", orderRouter);
app.use("/balance", balanceRouter);
app.use("/symbol", symbolRouter);
app.use("/reset", resetRouter);

app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}`);
});
