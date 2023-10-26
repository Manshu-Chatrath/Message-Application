import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { RequestValidationError } from "../errors/validation-error";
import { body } from "express-validator";
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const requestValidationError = new RequestValidationError(
      "Invalid Parameters!"
    );
    return res.status(requestValidationError.statusCode).send({
      message: requestValidationError.message,
      error: errors.array()[0].msg,
    });
  }
  next();
};

export const validateBody = [
  body("email").isEmail().withMessage("Email is not valid"),
  body("password")
    .trim()
    .isLength({ min: 4 })
    // .matches(/^(\+123)\d{11}$/)
    .withMessage(
      "Password must be more than 4 character and should contain 1 letter, 1 number and a special character"
    ),
];
