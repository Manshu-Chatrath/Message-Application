import express, { Request, Response } from "express";
import { DataBaseConnectionError } from "../errors/database-connection-error";
import { FindOptions } from "sequelize";
import { isAuth } from "../middlewares/isauth";
import Friends from "../models/friends";
const router = express.Router();
const { Op } = require("sequelize-typescript");

router.post(
  "/user-service/delete/friend",
  isAuth,
  async (req: Request, res: Response) => {
    try {
      const { email, userId } = req.body;
      let options: FindOptions = {
        where: { [Op.and]: [{ email: email }, { id: userId }] },
      };
      await Friends.destroy(options);

      return res.send({ message: "success" });
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
export { router as deleteRouter };
