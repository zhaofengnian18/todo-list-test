import Koa from "koa";
import Router from "@koa/router";
import mongoose from "mongoose";
import healthRouter from "./controller/health.js";
import todoRouter from "./controller/todo.js";
import database from "../config/database.js";

const app = new Koa();
const router = new Router();

router.use("/health", healthRouter.routes(), healthRouter.allowedMethods());
router.use("/todos", todoRouter.routes(), todoRouter.allowedMethods());

app.use(router.routes()).use(router.allowedMethods());

// 连接数据库
try {
  await database.connectDatabase();
  app.context.mongoose = mongoose;
} catch (error) {
  console.error('数据库连接失败:', error);
  process.exit(1);
}

// 启动服务器
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
