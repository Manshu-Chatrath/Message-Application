import {
  Table,
  Column,
  Model,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  DataType,
} from "sequelize-typescript";
import User from "./user";
interface MessageAttrs {
  id?: number;
  message: string;
  senderId: number;

  recipientId: number;
}

@Table({
  timestamps: true,
})
class Message extends Model<MessageAttrs> {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id?: number;

  @Column(DataType.STRING)
  message: string;

  @PrimaryKey
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  senderId: number;

  @BelongsTo(() => User, {
    foreignKey: "senderId",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  sender: User[];

  @BelongsTo(() => User, {
    foreignKey: "recipientId",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  recipient: User[];

  @PrimaryKey
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  recipientId: number;
}

export default Message;
