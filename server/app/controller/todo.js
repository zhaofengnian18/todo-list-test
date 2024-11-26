// routes/todo-routes.js
import Router from "@koa/router";
import TodoService from "../services/todo.js";
import { User, TodoList, TodoItem } from "../models/index.js";

const router = new Router();
const todoService = new TodoService({ User, TodoList, TodoItem });

// 获取TOP N的TODO项目
router.get("/top", async (ctx) => {
  const { limit = 10, userId } = ctx.query;

  try {
    const todos = await todoService.getTopTodoItems(userId, parseInt(limit));
    ctx.body = todos;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
});

export default router;
