import { Sequelize } from "sequelize-typescript";
import User from "./models/user";
import Friends from "./models/friends";
import Message from "./models/message";

const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,

  modelPaths: [__dirname + "/models"], // or [Player, Team],
});

sequelize.addModels([User, Message, Friends]);

export default sequelize;
