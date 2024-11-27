// models/schemas.js
import mongoose from "mongoose";

// User Schema
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
    // Automatically add version number
    timestamps: true,
    // Add sharding configuration
    shardKey: { username: 1 },
  }
);

export const User = mongoose.model("User", UserSchema);
