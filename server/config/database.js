import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// 加载环境变量配置文件
dotenv.config({ path: path.resolve(process.cwd(), "env/.env") });

async function connectDatabase() {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  const mongoUrl = process.env.MONGODB_URL || "mongodb://localhost:27017/todo_app";
  await mongoose.connect(mongoUrl, options);

  console.log("Connected to MongoDB:", mongoUrl);
}

export default { connectDatabase };
