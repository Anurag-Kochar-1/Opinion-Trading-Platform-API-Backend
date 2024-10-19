import { Router } from "express";

export const balanceRouter = Router();

balanceRouter.get("/", (req, res) => {
  res.status(201).json({ message: `BALANCE ROUTE` });
});
