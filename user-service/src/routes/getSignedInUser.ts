import express, { Request, Response } from "express";
import { DataBaseConnectionError } from "../errors/database-connection-error";
import User from "../models/user";
import { isAuth, user } from "../middlewares/isauth";

const router = express.Router();

router.get(
  "/user-service/getUser",
  isAuth,
  async (req: Request, res: Response) => {
    try {
      const signedInUser = await User.findOne({ where: { id: user.id } });

      return res.send({ user: signedInUser });
    } catch (err) {
      const dataBaseConnectionError = new DataBaseConnectionError(
        "Some Unexpected Error Occured!"
      );
      return res
        .status(dataBaseConnectionError.statusCode)
        .send({ message: dataBaseConnectionError.message });
    }
  }
);
export { router as getSignedInUserRouter };
