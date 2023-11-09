import express from "express";
import sequelize from "./database";
import { deleteRouter } from "./routes/delete";
import { userSearchRouter } from "./routes/search";
import { userEditRouter } from "./routes/userEdit";
import { addFriendRouter } from "./routes/addFriend";
import { uploadRouter } from "./routes/upload";
//import { nats  from "node-nats-streaming";
import { natsClient } from "./natClient";
import { getSignedInUserRouter } from "./routes/getSignedInUser";
import { key } from "../config/key";
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(deleteRouter);
app.use(userEditRouter);
app.use(userSearchRouter);
app.use(uploadRouter);
app.use(getSignedInUserRouter);
app.use(addFriendRouter);
const start = async () => {
  try {
    await natsClient.connect(
      process.env.NATS_CLUSTER_ID!,
      "czxf",
      process.env.NATS_URL!
    );
    natsClient.client.on("close", () => {
      console.log("NATS connection closed!");
      process.exit();
    });
    process.on("SIGINT", () => natsClient.client.close());
    process.on("SIGTERM", () => natsClient.client.close());

    sequelize
      .sync()
      .then(() => {
        app.listen(4001, () => console.log("Listening on port: 4001"));
      })
      .catch((err) => console.log(err));
  } catch (err) {
    console.log("So error is ", err);
  }
};
start();
