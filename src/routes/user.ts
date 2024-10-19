import { Router } from "express";

export const userRouter = Router();

userRouter.post("/create/:userId", (req, res) => {
  const { userId } = req.params;
  res.status(201).json({ message: `User ${userId} created` });
});
