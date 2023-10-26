import express, { Request, Response } from "express";
import { DataBaseConnectionError } from "../errors/database-connection-error";
import { isAuth } from "../middlewares/isauth";
const router = express.Router();
router.post(
  "/auth-service/signout",
  isAuth,
  async (req: Request, res: Response) => {
    try {
      req.session!.jwt = null;
      return res.send({ message: "Logged Out!" });
    } catch (e) {
      const dataBaseConnectionError = new DataBaseConnectionError(
        "Some Unexpected Error Occured!"
      );
      return res
        .status(dataBaseConnectionError.statusCode)
        .send({ message: dataBaseConnectionError.message });
    }
  }
);

export { router as signUpRouter };
