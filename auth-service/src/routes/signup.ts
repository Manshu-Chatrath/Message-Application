import express, { Request, Response } from "express";
import User from "../models/user";
import { FindOptions } from "sequelize";
import { BadRequestError } from "../errors/bad-request-error";
import { DataBaseConnectionError } from "../errors/database-connection-error";
import { body } from "express-validator";
import { validateRequest, validateBody } from "../middlewares/validationReq";
import { PasswordService } from "../services/password";
import sequelize from "../database";
const router = express.Router();

router.post(
  "/auth-service/signup",
  [
    ...validateBody,
    body("name")
      .isLength({ min: 4, max: 20 })
      .withMessage("Name must be more than 4 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      let options: FindOptions = {
        where: { email: req.body.email },
      };
      const user = await User.findOne(options);
      if (user?.email === req.body.email) {
        const badReq = new BadRequestError("User already exists!");
        return res.status(badReq.statusCode).send({ message: badReq.message });
      }

      const password = await PasswordService.hash(req.body.password);

      await User.create({
        email: req.body.email,
        password: password,
        name: req.body.name,
      });

      return res.send({ message: "success" });
    } catch (e) {
      console.log(e);
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
