import express, { Request, Response } from "express";
import { DataBaseConnectionError } from "../errors/database-connection-error";
import { isAuth } from "../middlewares/isauth";
import { PasswordService } from "../services/password";
import User from "../models/user";
const router = express.Router();
router.put(
  "/user-service/user",
  isAuth,
  async (req: Request, res: Response) => {
    try {
      let { password = null, id, src = null } = req.body;
      let obj: any = {};
      if (src) {
        obj!.src = src;
      }

      if (password) {
        password = await PasswordService.hash(req.body.password);
        obj!.password = password;
      }
      const user = await User.update(obj, { where: { id: id } });
      return res.send(user);
    } catch (err) {
      console.log(err);
      const dataBaseConnectionError = new DataBaseConnectionError(
        "Some Unexpected Error Occured!"
      );
      return res
        .status(dataBaseConnectionError.statusCode)
        .send({ message: dataBaseConnectionError.message });
    }
  }
);

export { router as userEditRouter };
