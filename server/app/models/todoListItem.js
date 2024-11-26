import mongoose from "mongoose";

const TodoItemSchema = new mongoose.Schema(
  {
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TodoList",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    score: {
      type: Number,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "ARCHIVED"],
      default: "PENDING",
    },
    version: {
      type: Number,
      default: 1,
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
    timestamps: true,
    // 复合分片键
    shardKey: { listId: 1, score: 1 },
  }
);

// 创建索引
TodoItemSchema.index({ score: -1 });
TodoItemSchema.index({ listId: 1, score: -1 });

export const TodoItem = mongoose.model("TodoItem", TodoItemSchema);
