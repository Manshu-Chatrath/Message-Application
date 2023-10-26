import express, { Request, Response } from "express";
import { DataBaseConnectionError } from "../errors/database-connection-error";
import { isAuth } from "../middlewares/isauth";
import User from "../models/user";
import { Op, col, Sequelize } from "sequelize";
const router = express.Router();

interface Query {
  name: string;
  count: string;
  startIndex: string;
  userId: number;
}

router.get("/user-service/search", isAuth, async (req: any, res: Response) => {
  //SELECT * FROM USERS INNER JOIN ON FRIENDS ON FRIENDS.FRIENDID !== USERID AND USER.NAME === '%NAME&'

  try {
    const { query } = req;
    let obj = {};
    if (query.name !== "") {
      obj = {
        name: {
          [Op.like]: `${query.name}%`,
        },
      };
    }
    const users = await User.findAll({
      raw: true,
      attributes: [
        // @ts-ignore
        [Sequelize.fn("DISTINCT", Sequelize.col("email")), "email"],
        "id",
        "name",
      ],

      offset: parseInt(query.startIndex),
      limit: parseInt(query.count),
      where: {
        ...obj,
        id: {
          [Op.ne]: query.userId,
        },
      },
    });
    if (users.length === 0) {
      return res.send({ message: "end" });
    }

    return res.send(users);
  } catch (err) {
    console.log(err);
    const dataBaseConnectionError = new DataBaseConnectionError(
      "Some Unexpected Error Occured!"
    );
    return res
      .status(dataBaseConnectionError.statusCode)
      .send({ message: dataBaseConnectionError.message });
  }
});

export { router as userSearchRouter };
