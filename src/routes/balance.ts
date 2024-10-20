import { Router } from "express";
import { REQUEST_TYPE } from "../types";
import { RedisManager } from "../lib/redis-manager";

export const balanceRouter = Router();

balanceRouter.get("/inr", async (req, res) => {
  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.GET_INR_BALANCES,
    playload: {},
  });
  res.json(response.payload);
});

balanceRouter.get("/inr/:userId", async (req, res) => {
  const { userId } = req.params;
  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.GET_USER_BALANCE,
    playload: { userId },
  });
  res.json(response.payload);
});

balanceRouter.get("/stock/:userId", async (req, res) => {
  const { userId } = req.params;
  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.GET_USER_STOCK_BALANCE,
    playload: { userId },
  });
  res.json(response.payload);
});

balanceRouter.get("/stock", async (req, res) => {
  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.GET_STOCK_BALANCES,
    playload: {},
  });
  res.json(response.payload);
});
