import {
  Table,
  Column,
  Model,
  AutoIncrement,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AllowNull,
  DataType,
} from "sequelize-typescript";
import User from "../models/user";
interface FriendRequestAttrs {
  id?: number;
  senderId: number;
  receiverId: number;
  status: string;
}

@Table({
  timestamps: true,
})
class FriendRequest extends Model<FriendRequestAttrs> {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id?: number;

  @BelongsTo(() => User, {
    foreignKey: "receiverId",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  receiver: User;

  @BelongsTo(() => User, {
    foreignKey: "senderId",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  sender: User;

  @PrimaryKey
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  receiverId: number;

  @PrimaryKey
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  senderId: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  status: string;
}

export default FriendRequest;
