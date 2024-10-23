import { Router } from "express";
import { REQUEST_TYPE } from "../types";
import { RedisManager } from "../lib/redis-manager";

export const tradeRouter = Router();

tradeRouter.post("/mint", async (req, res) => {
  const { userId, stockSymbol, quantity } = req.body;

  if (
    !userId ||
    !stockSymbol ||
    !quantity

  ) {
    res.status(400).json({
      error:
        "Invalid input.",
    });
    return;
  }
  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.MINT_TOKENS,
    data: { userId, stockSymbol, quantity },
  });
  const parsedResponse = JSON.parse(response?.payload?.message)
  res.status(parsedResponse?.statusCode).json(parsedResponse)
});
