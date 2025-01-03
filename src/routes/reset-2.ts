import { Router } from "express";
import { RedisManager } from "../lib/redis-manager";
import { REQUEST_TYPE } from "../types";
import { adminMiddleware } from "../middlewares/admin.middleware";

export const resetRouter = Router();

resetRouter.post("/", adminMiddleware, async (req, res) => {
  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.RESET_STATES,
    data: {},
  });
  const parsedResponse = JSON.parse(response?.payload?.message)
  res.status(parsedResponse?.statusCode).json(parsedResponse)
});
