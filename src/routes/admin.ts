import { Router } from "express";
import { RedisManager } from "../lib/redis-manager";
import { REQUEST_TYPE } from "../types";

export const adminRouter = Router();

adminRouter.post("/crash", async (req, res) => {
    RedisManager.getInstance().sendAndAwait({
        type: REQUEST_TYPE.CRASH_SERVER,
        data: {},
    });
    res.status(200).json({ message: "Server Crash Request Sent!" })
});

adminRouter.post("/restore-server-state", async (req, res) => {
    RedisManager.getInstance().sendAndAwait({
        type: REQUEST_TYPE.RESTORE_SERVER_STATE,
        data: {},
    });
    res.status(200).json({ message: "Restore Server State Request Sent!" })
});










