import { Router } from "express";

export const symbolRouter = Router();

symbolRouter.get("/", (req, res) => {
  res.status(201).json({ message: `SYMBOL ROUTE` });
});
