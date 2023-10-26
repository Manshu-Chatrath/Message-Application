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
interface FriendsAttrs {
  id?: number;
  userId: number;

  friendId: number;
}

@Table({
  timestamps: true,
})
class Friends extends Model<FriendsAttrs> {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id?: number;

  @BelongsTo(() => User, {
    foreignKey: "userId",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  user: User;

  @BelongsTo(() => User, {
    foreignKey: "friendId",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  friend: User;

  @PrimaryKey
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId: number;

  @PrimaryKey
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  friendId: number;
}

export default Friends;
