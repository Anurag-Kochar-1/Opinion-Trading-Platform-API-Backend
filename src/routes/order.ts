import { Router } from "express";

export const orderRouter = Router();

orderRouter.get("/", (req, res) => {
  res.status(201).json({ message: `ORDER ROUTE` });
});
