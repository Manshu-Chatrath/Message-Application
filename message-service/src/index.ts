import express, { Request, Response } from "express";
import sequelize from "./database";
import { Server } from "socket.io";
import { FriendRequestListener } from "./event/friendRequestListener";
import { SocketIo } from "./service/socketIo";
import { key } from "../config/key";
import { natsClient } from "./natsClient";
const app = express();
const cors = require("cors");
const http = require("http");
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
console.log(process.env.NATS_CLUSER_ID, " ", process.env.AWS_ACCESS_KEY);
export const socketInstance = new SocketIo(io);
socketInstance.initialize();
const start = async () => {
  try {
    await natsClient.connect(
      process.env.NATS_URL!,
      "czx",
      process.env.NATS_CLUSTER_ID!
    );
    natsClient.client.on("close", () => {
      console.log("NATS connection closed!");
      process.exit();
    });
    process.on("SIGINT", () => natsClient.client.close());
    process.on("SIGTERM", () => natsClient.client.close());

    new FriendRequestListener(natsClient.client).listen();
    sequelize
      .sync()
      .then(() => {
        server.listen(4002, () => console.log("Listening on port: 4002"));
      })
      .catch((err) => console.log(err));
  } catch (err) {
    console.log("So error is ", err);
  }
};
start();
