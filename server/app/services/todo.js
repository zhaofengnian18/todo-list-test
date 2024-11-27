import mongoose from "mongoose";

class TodoService {
  constructor(models) {
    this.models = models;
  }

  // Get top N TODO items
  async getTopTodoItems(userId, limit = 10) {
    // Parameter validation
    if (!userId) {
      throw new Error('User ID cannot be empty');
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }

    if (typeof limit !== 'number' || limit <= 0) {
      throw new Error('Limit parameter must be a number greater than 0');
    }

    // Use MongoDB aggregation pipeline
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
          "status": { $ne: "ARCHIVED" } // Exclude archived items
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
