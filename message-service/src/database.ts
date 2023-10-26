import { Sequelize } from "sequelize-typescript";
import User from "./models/user";
import Friends from "./models/friends";
import Message from "./models/message";
import { key } from "../config/key";
const sequelize = new Sequelize({
  dialect: "mysql",
  host: key.dataBaseHost,
  username: key.dataBaseUserName,
  database: key.dataBaseName,
  password: key.dataBasePassword,

  modelPaths: [__dirname + "/models"], // or [Player, Team],
});

sequelize.addModels([User, Message, Friends]);

export default sequelize;
