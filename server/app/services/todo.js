import mongoose from "mongoose";

class TodoService {
  constructor(models) {
    this.models = models;
  }

  // 获取TOP N的TODO项目
  async getTopTodoItems(userId, limit = 10) {
    // 参数校验
    if (!userId) {
      throw new Error('用户ID不能为空');
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('无效的用户ID格式');
    }

    if (typeof limit !== 'number' || limit <= 0) {
      throw new Error('limit参数必须是大于0的数字');
    }

    // 使用MongoDB的聚合管道
    const topItems = await this.models.TodoItem.aggregate([
      {
        $lookup: {
          from: "todolists",
          localField: "listId", 
          foreignField: "_id",
          as: "list",
        },
      },
      {
        $unwind: "$list",
      },
      {
        $match: {
          "list.userId": new mongoose.Types.ObjectId(userId),
          "status": { $ne: "ARCHIVED" } // 排除已归档的项目
        },
      },
      {
        $sort: { score: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          name: 1,
          description: 1,
          score: 1,
          status: 1,
          listId: 1,
          version: 1,
        },
      },
    ]);

    return topItems;
  }
}

export default TodoService;
