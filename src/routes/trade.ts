import { Router } from "express";
import { REQUEST_TYPE } from "../types";
import { RedisManager } from "../lib/redis-manager";

export const tradeRouter = Router();

tradeRouter.post("/mint", async (req, res) => {
  const { userId, stockSymbol, quantity, price } = req.body;

  if (
    !userId ||
    !stockSymbol ||
    !quantity ||
    quantity <= 0 ||
    !price ||
    price < 0 ||
    price > 10
  ) {
    res.status(400).json({
      error:
        "Invalid input. Ensure quantity is positive and price is between 0 and 10.",
    });
    return;
  }
  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.MINT_TOKENS,
    data: { userId, stockSymbol, quantity, price },
  });
  res.json(response.payload);
});
