import { Router } from "express";
import { RedisManager } from "../lib/redis-manager";
import { REQUEST_TYPE } from "../types";

export const symbolRouter = Router();

symbolRouter.post("/create/:stockSymbol", async (req, res) => {
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
