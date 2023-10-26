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
interface NotificationAttrs {
  id?: number;
  type: string;
  sentBy: number;
  recievedBy: number;
}

@Table({
  timestamps: true,
})
class Notifications extends Model<NotificationAttrs> {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id?: number;

  @Column(DataType.STRING)
  type: string;

  @PrimaryKey
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  sentBy: number;

  @BelongsTo(() => User, {
    foreignKey: "sentBy",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  sender: User[];

  @BelongsTo(() => User, {
    foreignKey: "recievedBy",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  recipient: User[];

  @PrimaryKey
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  recievedBy: number;
}

export default Notifications;
