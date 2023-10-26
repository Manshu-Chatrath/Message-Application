import { Message, Stan } from "node-nats-streaming";
import FriendRequest from "../models/friendRequest";
import { socketInstance } from "..";
import Friends from "../models/friends";
import { Op } from "sequelize";

export class FriendRequestListener {
  private client: Stan;
  subject = "friendRequest";
  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setDurableName("message-service");
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      "message-service",
      this.subscriptionOptions()
    );
    subscription.on("message", async (msg: Message) => {
      const data: any = msg.getData();
      const { senderId = null, receiverId = null } = JSON.parse(data);
      const friendExist = await Friends.findAll({
        where: {
          [Op.and]: [{ userId: senderId, friendId: receiverId }],
        },
      });
      if (friendExist.length > 0) {
        return;
      }

      const friendRequestExist = await FriendRequest.findAll({
        raw: true,
        where: {
          [Op.and]: [{ receiverId, senderId }],
        },
      });
      if (friendRequestExist.length > 0) {
        return;
      } else {
        if (senderId && receiverId) {
          try {
            await FriendRequest.create({
              receiverId: receiverId,
              senderId: senderId,
              status: "pending",
            });

            msg.ack();
            // @ts-ignore
            await socketInstance.sendRealTimeRequest(senderId, receiverId);
          } catch (err) {
            msg.ack();
          }
        }
      }
    });
  }
}
