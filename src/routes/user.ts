import { Router } from "express";
import { RedisManager } from "../lib/redis-manager";
import { REQUEST_TYPE } from "../types";

export const userRouter = Router();

userRouter.post("/create/:userId", async (req, res) => {
  const { userId } = req.params;
  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.CREATE_USER,
    playload: {
      userId,
    },
  });
  res.json(response.payload);
});
