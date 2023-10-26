import express, { Request, Response } from "express";
import { validateRequest, validateBody } from "../middlewares/validationReq";
import { PasswordService } from "../services/password";
import User from "../models/user";
import { BadRequestError } from "../errors/bad-request-error";
import { DataBaseConnectionError } from "../errors/database-connection-error";
import jwt from "jsonwebtoken";
const router = express.Router();
router.get("/auth-service/xvc", (req: Request, res: Response) => {
  return res.send("Hello World!");
});
router.post(
  "/auth-service/login",
  validateBody,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      let errorMessage: string | null = null;
      const user = await User.findOne({ where: { email: req.body.email } });

      if (!user) {
        errorMessage = "User Doesn't Exist!";
        const badReq = new BadRequestError(errorMessage);
        return res.status(badReq.statusCode).send({ message: badReq.message });
      } else {
        const isValid = await PasswordService.checkPassword(
          req.body.password,
          user!.password
        );

        if (!isValid) {
          errorMessage = "Invalid Password!";
        }

        if (errorMessage) {
          const badReq = new BadRequestError(errorMessage);
          return res
            .status(badReq.statusCode)
            .send({ message: badReq.message });
        }
        const token = jwt.sign(
          { email: req.body.email, userId: user!.id },
          "secret",
          { expiresIn: "1h" }
        );
        req.session = {
          jwt: token,
        };

        return res.status(200).send({
          email: user.email,
          name: user.name,
          userId: user.id,
          token,
          src: user?.src,
        });
      }
    } catch (e) {
      const dataBaseError = new DataBaseConnectionError(
        "Some Unexpected Error Occured"
      );
      return res
        .status(dataBaseError.statusCode)
        .send({ message: dataBaseError.message });
    }
  }
);

export { router as loginRouter };
