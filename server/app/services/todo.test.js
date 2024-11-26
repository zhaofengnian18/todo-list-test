import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import TodoService from '../services/todo.js';

describe('TodoService', () => {
  describe('getTopTodoItems', () => {
    let mockUser;
    let mockTodoList;
    let mockTodoItem;
    let todoService;

    beforeEach(() => {
      // 创建模拟的模型
      mockTodoItem = {
        aggregate: jest.fn()
      };

      mockUser = {};
      mockTodoList = {};

      todoService = new TodoService({
        User: mockUser,
        TodoList: mockTodoList,
        TodoItem: mockTodoItem
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('应该在userId为空时抛出错误', async () => {
      await expect(todoService.getTopTodoItems()).rejects.toThrow('用户ID不能为空');
    });

    it('应该在userId格式无效时抛出错误', async () => {
      await expect(todoService.getTopTodoItems('invalid-id')).rejects.toThrow('无效的用户ID格式');
    });

    it('应该在limit参数无效时抛出错误', async () => {
      const validUserId = new mongoose.Types.ObjectId().toString();
      await expect(todoService.getTopTodoItems(validUserId, -1)).rejects.toThrow('limit参数必须是大于0的数字');
    });

    it('应该正确返回用户的TOP N条待办事项', async () => {
      const validUserId = new mongoose.Types.ObjectId().toString();
      const mockItems = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: '测试待办1',
          description: '描述1',
          score: 10,
          status: 'PENDING',
          listId: new mongoose.Types.ObjectId(),
          version: 1
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: '测试待办2',
          description: '描述2', 
          score: 8,
          status: 'IN_PROGRESS',
          listId: new mongoose.Types.ObjectId(),
          version: 1
        }
      ];

      mockTodoItem.aggregate.mockResolvedValue(mockItems);

      const result = await todoService.getTopTodoItems(validUserId, 2);

      expect(result).toEqual(mockItems);
      expect(mockTodoItem.aggregate).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          $match: {
            'list.userId': new mongoose.Types.ObjectId(validUserId),
            'status': { $ne: 'ARCHIVED' }
          }
        }),
        expect.objectContaining({
          $sort: { score: -1 }
        }),
        expect.objectContaining({
          $limit: 2
        })
      ]));
    });
  });
});
