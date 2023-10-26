import { Request, Response, NextFunction } from "express";
import { key } from "../../config/key";
export const user = { id: "" };
const jwt = require("jsonwebtoken");
export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  let auth = req.get("Authorization");
  const token = auth;

  let decoded;
  try {
    decoded = jwt.verify(token, key.secretKey);
    user.id = decoded.userId;
    if (decoded) {
      next();
    }
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
