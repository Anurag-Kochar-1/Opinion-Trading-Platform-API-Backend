import { Router } from "express";

export const resetRouter = Router();

resetRouter.get("/", (req, res) => {
  res.status(201).json({ message: `RESET ROUTE` });
});
