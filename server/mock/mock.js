// scripts/generate-mock-data.js
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { program } from "commander";
import ProgressBar from "progress";
import { User, TodoList, TodoItem } from "../app/models/index.js";

// 命令行参数配置
program
  .option("-u, --users <number>", "用户数量", "100")
  .option("-l, --lists <number>", "每个用户的TODO列表数", "5")
  .option("-i, --items <number>", "每个列表的TODO项目数", "20")
  .option(
    "--url <string>",
    "MongoDB连接URL",
    "mongodb://localhost:27017/todo_app"
  )
  .parse(process.argv);

const options = program.opts();

// 生成器类
class MockDataGenerator {
  constructor(options) {
    this.options = options;
    this.users = [];
    this.lists = [];
    this.items = [];
  }

  // 连接数据库
  async connect() {
    await mongoose.connect(this.options.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  }

  // 清理现有数据
  async cleanup() {
    console.log("Cleaning up existing data...");
    await Promise.all([
      User.deleteMany({}),
      TodoList.deleteMany({}),
      TodoItem.deleteMany({}),
    ]);
  }

  // 生成用户数据
  async generateUsers() {
    console.log("Generating users...");
    const bar = new ProgressBar("[:bar] :current/:total :percent", {
      total: parseInt(this.options.users),
      width: 50,
    });

    const batchSize = 1000;
    const batches = Math.ceil(this.options.users / batchSize);

    for (let i = 0; i < batches; i++) {
      const users = [];
      const count = Math.min(batchSize, this.options.users - i * batchSize);

      for (let j = 0; j < count; j++) {
        users.push({
          username: faker.internet.userName(),
          email: faker.internet.email(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        });
        bar.tick();
      }

      const result = await User.insertMany(users);
      this.users.push(...result);
    }
  }

  // 生成TODO列表
  async generateTodoLists() {
    console.log("\nGenerating TODO lists...");
    const totalLists = this.users.length * this.options.lists;
    const bar = new ProgressBar("[:bar] :current/:total :percent", {
      total: totalLists,
      width: 50,
    });

    const batchSize = 1000;
    for (const user of this.users) {
      const lists = [];
      for (let i = 0; i < this.options.lists; i++) {
        lists.push({
          userId: user._id,
          name: faker.lorem.words(3),
          description: faker.lorem.sentence(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
          version: 1,
        });
        bar.tick();
      }

      // 批量插入
      const result = await TodoList.insertMany(lists);
      this.lists.push(...result);
    }
  }

  // 生成TODO项目
  async generateTodoItems() {
    console.log("\nGenerating TODO items...");
    const totalItems = this.lists.length * this.options.items;
    const bar = new ProgressBar("[:bar] :current/:total :percent", {
      total: totalItems,
      width: 50,
    });

    const batchSize = 5000;
    const batches = Math.ceil(totalItems / batchSize);

    for (let i = 0; i < batches; i++) {
      const items = [];
      const count = Math.min(batchSize, totalItems - i * batchSize);

      for (let j = 0; j < count; j++) {
        const list = this.lists[Math.floor(j / this.options.items)];
        items.push({
          listId: list._id,
          name: faker.lorem.sentence(3),
          description: faker.lorem.paragraph(),
          score: this.generateScore(),
          status: this.generateStatus(),
          version: 1,
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        });
        bar.tick();
      }

      await TodoItem.insertMany(items);
    }
  }

  // 生成优先级分数（使用正态分布）
  generateScore() {
    // 使用Box-Muller变换生成正态分布
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    // 转换到0-100范围，均值50，标准差15
    num = Math.round(num * 15 + 50);
    return Math.max(0, Math.min(100, num));
  }

  // 生成状态
  generateStatus() {
    const statuses = ["PENDING", "COMPLETED", "ARCHIVED"];
    const weights = [0.6, 0.3, 0.1]; // 60% 待处理，30% 完成，10% 归档
    const rand = Math.random();
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (rand < sum) return statuses[i];
    }
    return statuses[0];
  }

  // 创建索引
  async createIndexes() {
    console.log("\nCreating indexes...");
    await Promise.all([
      TodoItem.collection.createIndex({ score: -1 }),
      TodoItem.collection.createIndex({ listId: 1, score: -1 }),
      TodoList.collection.createIndex({ userId: 1 }),
    ]);
  }

  // 生成统计信息
  async generateStats() {
    const stats = {
      users: await User.countDocuments(),
      lists: await TodoList.countDocuments(),
      items: await TodoItem.countDocuments(),
      itemsByStatus: await TodoItem.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      scoreDistribution: await TodoItem.aggregate([
        {
          $bucket: {
            groupBy: "$score",
            boundaries: [0, 20, 40, 60, 80, 100],
            default: "Other",
            output: {
              count: { $sum: 1 },
            },
          },
        },
      ]),
    };

    console.log("\nGenerated Data Statistics:");
    console.log("-------------------------");
    console.log(`Users: ${stats.users}`);
    console.log(`TODO Lists: ${stats.lists}`);
    console.log(`TODO Items: ${stats.items}`);
    console.log("\nItems by Status:");
    stats.itemsByStatus.forEach((s) => {
      console.log(`${s._id}: ${s.count}`);
    });
    console.log("\nScore Distribution:");
    stats.scoreDistribution.forEach((s) => {
      console.log(`${s._id}: ${s.count} items`);
    });
  }

  // 运行生成器
  async run() {
    try {
      console.time("Data generation completed in");
      await this.connect();
      await this.cleanup();
      await this.generateUsers();
      await this.generateTodoLists();
      await this.generateTodoItems();
      await this.createIndexes();
      await this.generateStats();
      console.timeEnd("Data generation completed in");
    } catch (error) {
      console.error("Error generating mock data:", error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
    }
  }
}

// 执行生成器
const generator = new MockDataGenerator({
  users: parseInt(options.users),
  lists: parseInt(options.lists),
  items: parseInt(options.items),
  url: options.url,
});

generator.run();
