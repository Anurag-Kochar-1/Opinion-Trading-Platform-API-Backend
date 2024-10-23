import { Router } from "express";
import { REQUEST_TYPE } from "../types";
import { RedisManager } from "../lib/redis-manager";

export const orderBookRouter = Router();

orderBookRouter.get("/", async (req, res) => {
  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.VIEW_ORDERBOOK,
    data: {},
  });
  const parsedResponse = JSON.parse(response?.payload?.message)
  res.status(parsedResponse?.statusCode).json(parsedResponse)
});

orderBookRouter.get("/:stockSymbol", async (req, res) => {
  const { stockSymbol } = req.params;
  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.GET_ORDERBOOK_BY_STOCK_SYMBOL,
    data: { stockSymbol },
  });
  const parsedResponse = JSON.parse(response?.payload?.message)
  res.status(parseInt(parsedResponse?.statusCode)).json(parsedResponse)
});
