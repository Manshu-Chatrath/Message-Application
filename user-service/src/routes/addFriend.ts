import express, { Request, Response } from "express";
import { DataBaseConnectionError } from "../errors/database-connection-error";
import Publisher from "../events/publisher";
import { isAuth } from "../middlewares/isauth";
import { natsClient } from "../natClient";
const router = express.Router();
router.get("/user-service/ds", (req: Request, res: Response) => {
  return res.send("Hello World!");
});
router.post(
  "/user-service/addFriend",
  isAuth,
  async (req: Request, res: Response) => {
    try {
      const { userId, friendId } = req.body;

      await new Publisher(natsClient.client).publish("friendRequest", {
        senderId: userId,
        receiverId: friendId,
      });

      return res.send({ message: "success" });
    } catch (err) {
      const dataBaseConnectionError = new DataBaseConnectionError(
        "Some Unexpected Error Occured!"
      );
      return res
        .status(dataBaseConnectionError.statusCode)
        .send({ message: dataBaseConnectionError.message });
    }
  }
);
export { router as addFriendRouter };
