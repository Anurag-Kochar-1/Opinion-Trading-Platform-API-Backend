import { Router } from "express";
import { RedisManager } from "../lib/redis-manager";
import { REQUEST_TYPE } from "../types";

export const onRampRouter = Router();

onRampRouter.post("/inr", async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount || amount <= 0) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.ONRAMP_USER_BALANCE,
    data: { userId, amount },
  });

  const parsedResponse = JSON.parse(response?.payload?.message)
  res.status(parsedResponse?.statusCode).json(parsedResponse)
});
