import { Router } from "express";
import { RedisManager } from "../lib/redis-manager";
import { REQUEST_TYPE } from "../types";
import { adminMiddleware } from "../middlewares/admin.middleware";

export const symbolRouter = Router();

symbolRouter.post("/create/:stockSymbol", adminMiddleware, async (req, res) => {
  const { stockSymbol } = req.params;

  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.CREATE_SYMBOL,
    data: {
      stockSymbol,
    },
  });
  const parsedResponse = JSON.parse(response?.payload?.message)
  res.status(parsedResponse?.statusCode).json(parsedResponse)
});

symbolRouter.get("/", async (req, res) => {
  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.GET_ALL_STOCK_SYMBOLS,
    data: {}
  });
  const parsedResponse = JSON.parse(response?.payload?.message)
  res.status(parsedResponse?.statusCode).json(parsedResponse)
});

