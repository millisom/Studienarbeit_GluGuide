const UserModel = require('../../models/userModel');
const pool = require('../../config/db');


const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};
jest.mock('../../config/db', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

describe('UserModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.connect.mockResolvedValue(mockClient);
  });

  describe('getAllUsers', () => {
    it('returns list of users', async () => {
      const rows = [{ id: 1, username: 'Alice' }, { id: 2, username: 'Bob' }];
      pool.query.mockResolvedValue({ rows });
      const result = await UserModel.getAllUsers();
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT id'));
      expect(result).toHaveLength(2);
    });

    it('throws on DB error', async () => {
      pool.query.mockRejectedValue(new Error('DB'));
      await expect(UserModel.getAllUsers()).rejects.toThrow('Error fetching users');
    });
  });

  describe('getUserById', () => {
    it('returns user', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 5, username: 'Charlie' }] });
      const result = await UserModel.getUserById(5);
      expect(result).toEqual({ id: 5, username: 'Charlie' });
    });

    it('returns undefined when not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const result = await UserModel.getUserById(999);
      expect(result).toBeUndefined();
    });
  });

  describe('deleteUserById', () => {
    it('executes transaction and deletes all user data', async () => {
      mockClient.query.mockResolvedValue({ rows: [] });
      await UserModel.deleteUserById(7);

 
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM meals'), [7]);
      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM users'), [7]);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('rolls back on error and throws', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) 
        .mockRejectedValueOnce(new Error('FK error'));

      await expect(UserModel.deleteUserById(7)).rejects.toThrow('Error deleting user');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
