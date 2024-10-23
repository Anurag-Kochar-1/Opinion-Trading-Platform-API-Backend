import { Router } from "express";
import { RedisManager } from "../lib/redis-manager";
import { REQUEST_TYPE } from "../types";

export const userRouter = Router();

userRouter.post("/create/:userId", async (req, res) => {
  const { userId } = req.params;
  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.CREATE_USER,
    data: {
      userId,
    },
  });
  const parsedResponse = JSON.parse(response?.payload?.message)
  res.status(parsedResponse?.statusCode).json(parsedResponse)
});

userRouter.get("/", (req,res) => {
  process.exit(1)
})

