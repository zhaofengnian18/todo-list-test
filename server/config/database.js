import mongoose from "mongoose";

async function connectDatabase() {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  await mongoose.connect("mongodb://localhost:27017/todo_app", options);

  // 确保索引存在
//   await mongoose.model("TodoItem").ensureIndexes();

  console.log("Connected to MongoDB");
}

export default { connectDatabase };
