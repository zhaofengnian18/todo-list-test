// models/schemas.js
import mongoose from "mongoose";

// 用户Schema
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // 自动添加版本号
    timestamps: true,
    // 添加分片配置
    shardKey: { username: 1 },
  }
);

export const User = mongoose.model("User", UserSchema);
