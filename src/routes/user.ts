import { Router } from "express";
import { RedisManager } from "../lib/redis-manager";

export const userRouter = Router();

userRouter.post("/create/:userId", async (req, res) => {
  const { userId } = req.params;
  const response = await RedisManager.getInstance().sendAndAwait({
    type: "CREATE_USER",
    data: {
      userId,
    },
  });
  console.log(response.payload);
  res.json({
    message: "ok",
  });
});
