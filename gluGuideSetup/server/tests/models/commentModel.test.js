const Comment = require('../../models/commentModel');
const pool = require('../../config/db');

jest.mock('../../config/db', () => ({ query: jest.fn() }));

describe('CommentModel', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createComment', () => {
    it('inserts and returns new comment', async () => {
      const row = { id: 1, post_id: 10, author_id: 1, content: 'Hello' };
      pool.query.mockResolvedValue({ rows: [row] });
      const result = await Comment.createComment(10, 1, 'Hello');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO comments'), [10, 1, 'Hello']);
      expect(result).toEqual(row);
    });

    it('throws on DB error', async () => {
      pool.query.mockRejectedValue(new Error('DB'));
      await expect(Comment.createComment(1, 1, 'x')).rejects.toThrow('Error creating comment');
    });
  });

  describe('getUserIdByUsername', () => {
    it('returns user id', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 7 }] });
      const result = await Comment.getUserIdByUsername('bob');
      expect(result).toBe(7);
    });

    it('returns null when user not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      expect(await Comment.getUserIdByUsername('unknown')).toBeNull();
    });
  });

  describe('getCommentsByPostId', () => {
    it('returns comments with username', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1, username: 'alice' }] });
      const result = await Comment.getCommentsByPostId(10);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('JOIN users'), [10]);
      expect(result).toHaveLength(1);
    });
  });

  describe('getCommentById', () => {
    it('returns comment by id', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 5 }] });
      const result = await Comment.getCommentById(5);
      expect(result).toEqual({ id: 5 });
    });
  });

  describe('updateCommentById', () => {
    it('updates comment and returns updated row', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1, content: 'updated' }] });
      const result = await Comment.updateCommentById(1, 'updated');
      expect(result).toEqual({ id: 1, content: 'updated' });
    });
  });

  describe('deleteCommentById', () => {
    it('deletes comment without error', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });
      await expect(Comment.deleteCommentById(1)).resolves.not.toThrow();
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM comments'), [1]);
    });
  });

  describe('toggleLike', () => {
    it('toggles like and returns updated counts', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ dislikes: 0 }] })        
        .mockResolvedValueOnce({ rows: [{ likes: 1, dislikes: 0 }] }); 
      const result = await Comment.toggleLike(1, 2);
      expect(result).toEqual({ likes: 1, dislikes: 0 });
    });
  });

  describe('toggleDislike', () => {
    it('toggles dislike and returns updated counts', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ likes: 0 }] })             
        .mockResolvedValueOnce({ rows: [{ likes: 0, dislikes: 1 }] });
      const result = await Comment.toggleDislike(1, 2);
      expect(result).toEqual({ likes: 0, dislikes: 1 });
    });
  });
});
