import { Router } from "express";
import { RedisManager } from "../lib/redis-manager";
import { REQUEST_TYPE } from "../types";

export const resetRouter = Router();

resetRouter.post("/", async (req, res) => {
  const response = await RedisManager.getInstance().sendAndAwait({
    type: REQUEST_TYPE.RESET_STATES,
    payload: {},
  });
  res.json(response.payload);
});
