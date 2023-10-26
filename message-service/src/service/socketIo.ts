import { FindOptions } from "sequelize";
import Friends from "../models/friends";
import User from "../models/user";
import Message from "../models/message";
import Notifications from "../models/notifications";
import FriendRequest from "../models/friendRequest";
import { Socket } from "socket.io/dist/socket";
import { Op, col, or, Sequelize } from "sequelize";

const jwt = require("jsonwebtoken");
export class SocketIo {
  public io: any;
  public socket: Socket;

  constructor(io: any) {
    this.io = io;
  }

  initialize() {
    this.io.use((socket: any, next: any) => {
      let token = socket.handshake.query.token;

      // Verify the token
      jwt.verify(token, "secret", (err: any, decoded: any) => {
        if (err) {
          return next(new Error("Authentication error"));
        }
        socket.decoded = decoded;
        next();
      });
    });

    this.io.on("connection", async (socket: Socket) => {
      this.socket = socket;
      let id: number;

      socket.on("online", async (message) => {
        try {
          //Here comes the user online

          const { userId } = message;

          id = userId;
          let options: any = {
            where: {
              id: userId,
            },
          };

          await User.update({ socketId: socket.id }, options);

          this.io.emit("onlineFriends", { id: userId, socketId: socket.id });
        } catch (err) {
          console.log(err);
        }
      });

      socket.on("sendNotification", async ({ sentBy, recievedBy, type }) => {
        try {
          const user = await User.findOne({ where: { id: recievedBy } });

          await Notifications.create({
            sentBy,
            recievedBy,
            type,
          });

          if (user?.dataValues.hasOwnProperty("socketId")) {
            // @ts-ignore
            const { socketId = null } = user?.dataValues;
            console.log(
              "Here we are it did send the notification and the socket id is ",
              socketId
            );
            // @ts-ignore
            this.io.to(socketId).emit("getRecentNotification", {
              notifications: 1,
              sentBy,
              type: "message",
            });
          }
        } catch (err) {
          console.log(err);
        }
      });

      socket.on("logout", async (userId) => {
        let options: any = {
          where: {
            id: userId,
          },
        };
        await User.update({ socketId: null }, options);
      });

      socket.on("getAllNotifications", async (userId) => {
        let obj: any = {};
        const notifications = await Notifications.findAll({
          attributes: [
            "sentBy",
            // @ts-ignore
            [Sequelize.literal("COUNT(id)"), "notifications"],
            "type",
          ],
          where: {
            recievedBy: {
              [Op.eq]: userId,
            },
          },
          group: ["sentBy"],
          raw: true,
        });

        notifications.map((notification: any) => {
          obj[notification.sentBy] = notification;
        });

        this.io.to(socket.id).emit("getAllNotifications", obj);
      });

      socket.on("sendMessage", async ({ senderId, recipientId, message }) => {
        //Here comes the user online

        const user = await User.findOne({ where: { id: recipientId } });

        try {
          const messageCreate = await Message.create({
            recipientId: recipientId,
            senderId,
            message,
          });

          if (user?.dataValues.hasOwnProperty("socketId")) {
            const { socketId = null } = user?.dataValues;

            this.io.to(socketId).emit("getRecentMessage", {
              id: messageCreate.id,
              recipientId: messageCreate.recipientId,
              senderId: messageCreate.senderId,
              message: messageCreate.message,
            });
          }
        } catch (err) {}
      });

      socket.on("readNotification", async ({ sentBy, recievedBy }) => {
        try {
          await Notifications.destroy({
            where: {
              [Op.and]: [{ recievedBy: recievedBy }, { sentBy: sentBy }],
            },
          });

          const notifications = await Notifications.findAll({
            attributes: [
              "sentBy",
              // @ts-ignore
              [Sequelize.literal("COUNT(id)"), "notifications"],
              "type",
            ],
            where: {
              recievedBy: {
                [Op.eq]: recievedBy,
              },
            },
            group: ["sentBy"],
            raw: true,
          });

          this.io.to(socket.id).emit("getAllNotifications", notifications);
        } catch (err) {
          console.log(err);
        }
      });

      socket.on("getMessages", async ({ senderId, recipientId }) => {
        const messages = await Message.findAll({
          raw: true,
          attributes: ["*"],
          order: [["id", "ASC"]],
          where: {
            [Op.or]: [
              {
                senderId: {
                  [Op.eq]: senderId,
                },
                recipientId: {
                  [Op.eq]: recipientId,
                },
              },
              {
                senderId: {
                  [Op.eq]: recipientId,
                },
                recipientId: {
                  [Op.eq]: senderId,
                },
              },
            ],
          },
        });
        this.io.to(socket.id).emit("getMessages", messages);
      });
      socket.on("allFriendRequests", async (userId) => {
        const obj: any = {};

        const requests = await User.findAll({
          raw: true,
          attributes: ["name", "email", "src", "id"],
          include: [
            {
              model: FriendRequest,
              attributes: ["status"],
              required: false,
              as: "receiverId",
              on: {
                receiverId: {
                  [Op.eq]: userId,
                },
              },
            },
          ],
          where: {
            id: {
              [Op.eq]: col("senderId"),
            },
          },
        });

        requests.map((request: User) => {
          // @ts-ignore
          obj[request.id] = request;
        });

        this.io.to(socket.id).emit("allFriendRequests", obj);
      });

      socket.on("acceptRequest", async ({ receiverId, senderId }) => {
        try {
          let obj: any = {};
          const friendExist = await Friends.findAll({
            where: {
              [Op.and]: [
                {
                  userId: senderId,
                  friendId: receiverId,
                },
              ],
            },
          });

          if (friendExist.length > 0) {
            return;
          } else {
            await Friends.create({ userId: receiverId, friendId: senderId });
            await Friends.create({ userId: senderId, friendId: receiverId });

            const user = await User.findByPk(senderId);
            let options: FindOptions = {
              where: {
                [Op.and]: [{ receiverId }, { senderId }],
              },
            };
            await FriendRequest.destroy(options);
            const friends = await User.findAll({
              raw: true,
              attributes: ["name", "email", "id", "src", "socketId"],
              include: [
                {
                  model: Friends,
                  attributes: [],
                  required: false,
                  as: "friendId",
                  on: {
                    friendId: {
                      [Op.eq]: id,
                    },
                  },
                },
              ],
              where: {
                id: {
                  [Op.eq]: col("userId"),
                },
              },
            });

            friends.map((friend: any) => {
              obj[friend.id] = friend;
            });

            this.io.to(socket.id).emit("friends", obj);

            const requests = await User.findAll({
              raw: true,
              attributes: ["name", "email", "id", "src"],
              include: [
                {
                  model: FriendRequest,
                  attributes: ["status"],
                  required: false,
                  as: "receiverId",
                  on: {
                    receiverId: {
                      [Op.eq]: receiverId,
                    },
                  },
                },
              ],
              where: {
                id: {
                  [Op.eq]: col("senderId"),
                },
              },
            });
            let obj2: any = {};
            requests.map((request: User) => {
              // @ts-ignore
              obj2[request.id] = request;
            });

            this.io.to(socket.id).emit("allFriendRequests", obj2);

            const friendsList = await User.findAll({
              raw: true,
              attributes: ["name", "email", "id", "src", "socketId"],
              include: [
                {
                  model: Friends,
                  attributes: [],
                  required: false,
                  as: "friendId",
                  on: {
                    friendId: {
                      [Op.eq]: senderId,
                    },
                  },
                },
              ],
              where: {
                id: {
                  [Op.eq]: col("userId"),
                },
              },
            });
            obj = {};
            friendsList.map((friend: any) => {
              obj[friend.id] = friend;
            });

            if (user?.socketId) {
              this.io.to(user.socketId).emit("friends", obj);
            }
          }
        } catch (er) {
          console.log(er);
        }
      });

      socket.on("sentRequest", async (id) => {
        try {
          const friendRequests = await User.findAll({
            attributes: ["name", "id", "src", "socketId"],
            include: [
              {
                model: FriendRequest,
                attributes: ["senderId", "receiverId"],
                required: true,
                as: "senderId",
                on: {
                  senderId: {
                    [Op.eq]: id,
                  },
                },
              },
            ],
            where: {
              id: {
                [Op.eq]: col("senderId"),
              },
            },
            raw: true,
          });
          let obj: any = {};

          friendRequests.map((request: any) => {
            obj[request["senderId.receiverId"]] = {
              receiverId: request["senderId.receiverId"],
              senderId: request["senderId.senderId"],
            };
          });

          this.io.to(socket.id).emit("sentRequest", obj);
        } catch (err) {
          console.log(err);
        }
      });

      socket.on("friends", async () => {
        let obj: any = {};
        try {
          const friends = await User.findAll({
            raw: true,
            attributes: ["name", "email", "id", "src", "socketId"],
            include: [
              {
                model: Friends,
                attributes: [],
                required: false,
                as: "friendId",
                on: {
                  friendId: {
                    [Op.eq]: id,
                  },
                },
              },
            ],
            where: {
              id: {
                [Op.eq]: col("userId"),
              },
            },
          });

          friends.map((friend: any) => {
            obj[friend.id] = friend;
          });

          this.io.to(socket.id).emit("friends", obj);
        } catch (er) {
          console.log(er);
        }
      });

      socket.on("disconnect", async () => {
        try {
          await User.update(
            { socketId: null },
            {
              where: {
                id: id,
              },
            }
          );

          this.io.emit("offlineFriend", { id, socketId: null });
        } catch (er) {
          console.log(er);
        }
        //Here comes the user offline
      });
    });
  }

  async sendRealTimeRequest(senderId: number, receiverId: number) {
    const user = await User.findOne({ where: { id: receiverId } });
    let obj: any = {};

    const friendRequests = await User.findAll({
      raw: true,
      attributes: ["name", "email", "src", "id"],
      include: [
        {
          model: FriendRequest,
          attributes: ["status"],
          required: false,
          as: "receiverId",
          on: {
            receiverId: {
              [Op.eq]: receiverId,
            },
          },
        },
      ],
      where: {
        id: {
          [Op.eq]: col("senderId"),
        },
      },
    });

    friendRequests.map((request: User) => {
      // @ts-ignore
      obj[request.id] = request;
    });
    if (obj.hasOwnProperty("obj")) {
      // @ts-ignore
      obj = obj.obj;
    }

    if (user?.dataValues.hasOwnProperty("socketId")) {
      const { socketId = null } = user?.dataValues;
      this.io.to(socketId).emit("allFriendRequests", obj);
    }

    obj = {};
    const sender = await User.findOne({ where: { id: senderId } });
    const requests = await User.findAll({
      attributes: ["name", "id", "src", "socketId"],
      include: [
        {
          model: FriendRequest,
          attributes: ["senderId", "receiverId"],
          required: true,
          as: "senderId",
          on: {
            senderId: {
              [Op.eq]: senderId,
            },
          },
        },
      ],
      where: {
        id: {
          [Op.eq]: col("senderId"),
        },
      },
      raw: true,
    });

    requests.map((request: any) => {
      obj[request["senderId.receiverId"]] = {
        receiverId: request["senderId.receiverId"],
        senderId: request["senderId.senderId"],
      };
    });

    this.io.to(sender?.socketId).emit("sentRequest", obj);
  }
}
