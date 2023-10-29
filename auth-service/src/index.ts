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

sequelize
  .sync()
  .then((res) => {
    console.log(process.env.DATABASE_USERNAME);
    console.log(process.env.DATABASE_HOST);
    console.log(process.env.DATABASE_NAME);
    console.log(process.env.DATABASE_PASSWORD);
    app.listen(4000, () => console.log("Listening on port: 4000"));
  })
  .catch((err) => console.log(err));
