import { Request, Response, NextFunction } from "express";
import { key } from "../../config/key";
const jwt = require("jsonwebtoken");
export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let auth = req.get("Authorization");
  const token = auth;
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_KEY);
    if (decoded) {
      next();
    }
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
