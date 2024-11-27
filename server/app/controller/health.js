import Router from "@koa/router";
const router = new Router();

router.get("/", async (ctx) => {
  try {
    // check mongodb connection
    await ctx.mongoose.connection.db.admin().ping();
    ctx.body = {
      status: "ok",
      timestamp: new Date(),
      service: "todo-app",
      mongodb: "connected",
    };
  } catch (error) {
    ctx.status = 503;
    ctx.body = {
      status: "error",
      timestamp: new Date(),
      service: "todo-app",
      error: error.message,
    };
  }
});

export default router;
