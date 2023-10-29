import express, { Request, Response } from "express";
import sequelize from "./database";
import { signUpRouter } from "./routes/signup";
import { loginRouter } from "./routes/signin";
const app = express();
const cors = require("cors");
const corsOptions = {
  origin: "https://message-application-e0a2c7e4d415.herokuapp.com", // Replace with your Heroku app's domain
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(signUpRouter);
app.use(loginRouter);

sequelize
  .sync()
  .then((res) => {
    app.listen(4000, () => console.log("Listening on port: 4000"));
  })
  .catch((err) => console.log(err));
