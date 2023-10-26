import express, { Request, Response } from "express";
import sequelize from "./database";
import { signUpRouter } from "./routes/signup";
import { loginRouter } from "./routes/signin";
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(signUpRouter);
app.use(loginRouter);
app.get("/sda", (req: Request, res: Response) => {
  return res.send({ message: "Logged Out!" });
});
sequelize
  .sync()
  .then((res) => {
    app.listen(4000, () => console.log("Listening on port: 4000"));
  })
  .catch((err) => console.log(err));
