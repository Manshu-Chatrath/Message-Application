import {
  Table,
  Column,
  Model,
  AutoIncrement,
  PrimaryKey,
  HasMany,
  AllowNull,
  DataType,
} from "sequelize-typescript";
import Friends from "../models/friends";
import FriendRequest from "./friendRequest";
import Message from "./message";
interface UserAttrs {
  id?: number;
  name: string;
  email: string;
  imageUuid: string;
  src: string;
  socketId: string | null;
  password: string;
}

@Table({
  timestamps: true,
})
class User extends Model<UserAttrs> {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id?: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  email: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  password: string;

  @Column(DataType.STRING)
  src: string;

  @Column(DataType.STRING)
  imageUuid: string;

  @Column(DataType.STRING)
  socketId: string;

  @HasMany(() => Message, {
    foreignKey: "senderId",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  messageSent: Message[];

  @HasMany(() => Message, {
    foreignKey: "recipientId",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  messageReceived: Message[];

  @HasMany(() => Friends, {
    foreignKey: "friendId",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  friendId: Friends[];

  @HasMany(() => Friends, {
    foreignKey: "userId",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  userId: Friends[];

  @HasMany(() => FriendRequest, {
    foreignKey: "senderId",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  senderId: Friends[];

  @HasMany(() => FriendRequest, {
    foreignKey: "receiverId",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  receiverId: Friends[];
}

export default User;
