import { Router } from "express";
import { RedisManager } from "../lib/redis-manager";
import { REQUEST_TYPE } from "../types";

export const orderRouter = Router();

orderRouter.post("/buy", async (req, res) => {
  const { userId, stockSymbol, quantity, price, stockType } = req.body;

  if (!userId || !stockSymbol || !quantity || !price || !stockType) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.BUY_ORDER,
    playload: { userId, stockSymbol, quantity, price, stockType },
  });
  res.json(response.payload);
});

orderRouter.post("/sell", async (req, res) => {
  const { userId, stockSymbol, quantity, price, stockType } = req.body;

  if (!userId || !stockSymbol || !quantity || !price || !stockType) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.SELL_ORDER,
    playload: { userId, stockSymbol, quantity, price, stockType },
  });
  res.json(response.payload);
});
