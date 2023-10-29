import express, { Request, Response } from "express";
import sequelize from "./database";
import { Server } from "socket.io";
import { FriendRequestListener } from "./event/friendRequestListener";
import { SocketIo } from "./service/socketIo";
import { key } from "../config/key";
import { natsClient } from "./natsClient";
const app = express();

const http = require("http");
const cors = require("cors");
const corsOptions = {
  origin: "https://message-application-e0a2c7e4d415.herokuapp.com", // Replace with your Heroku app's domain
};

app.use(cors(corsOptions));

app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://message-application-e0a2c7e4d415.herokuapp.com",
    methods: ["GET", "POST"],
  },
});

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
