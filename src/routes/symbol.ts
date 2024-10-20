import { Router } from "express";
import { RedisManager } from "../lib/redis-manager";
import { REQUEST_TYPE } from "../types";

export const symbolRouter = Router();

symbolRouter.get("/", (req, res) => {
  res.status(201).json({ message: `SYMBOL ROUTE` });
});

symbolRouter.post("/create/:stockSymbol", async (req, res) => {
  const { stockSymbol } = req.params;

  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.CREATE_SYMBOL,
    playload: {
      stockSymbol,
    },
  });
  res.json(response.payload);
});
