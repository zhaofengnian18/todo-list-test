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
      // Create mock models
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

    it('should throw error when userId is empty', async () => {
      await expect(todoService.getTopTodoItems()).rejects.toThrow('User ID cannot be empty');
    });

    it('should throw error when userId format is invalid', async () => {
      await expect(todoService.getTopTodoItems('invalid-id')).rejects.toThrow('Invalid user ID format');
    });

    it('should throw error when limit parameter is invalid', async () => {
      const validUserId = new mongoose.Types.ObjectId().toString();
      await expect(todoService.getTopTodoItems(validUserId, -1)).rejects.toThrow('Limit parameter must be a number greater than 0');
    });

    it('should correctly return top N todo items for user', async () => {
      const validUserId = new mongoose.Types.ObjectId().toString();
      const mockItems = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Test Todo 1',
          description: 'Description 1',
          score: 10,
          status: 'PENDING',
          listId: new mongoose.Types.ObjectId(),
          version: 1
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Test Todo 2',
          description: 'Description 2',
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
