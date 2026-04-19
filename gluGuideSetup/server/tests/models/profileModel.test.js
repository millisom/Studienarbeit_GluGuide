const Profile = require('../../models/profileModel');
const pool    = require('../../config/db');

jest.mock('../../config/db', () => ({ query: jest.fn() }));

describe('ProfileModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());


  describe('getuserbio', () => {
    it('returns bio row', async () => {
      pool.query.mockResolvedValue({ rows: [{ profile_bio: 'Hello' }] });
      const result = await Profile.getuserbio('alice');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT profile_bio'), ['alice']);
      expect(result).toEqual({ profile_bio: 'Hello' });
    });

    it('returns undefined when user not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      expect(await Profile.getuserbio('nobody')).toBeUndefined();
    });

    it('throws on DB error', async () => {
      pool.query.mockRejectedValue(new Error('DB'));
      await expect(Profile.getuserbio('alice')).rejects.toThrow('Error fetching user bio');
    });
  });


  describe('setUserbio', () => {
    it('updates bio and returns rowCount', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });
      const result = await Profile.setUserbio('alice', 'New bio');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE users'), ['New bio', 'alice']);
      expect(result).toBe(1);
    });

    it('throws when no rows updated', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });
      await expect(Profile.setUserbio('nobody', 'bio')).rejects.toThrow();
    });
  });

  describe('getUserDp', () => {
    it('returns profile picture path', async () => {
      pool.query.mockResolvedValue({ rows: [{ profile_picture: 'avatar.jpg' }] });
      const result = await Profile.getUserDp('alice');
      expect(result).toEqual({ profile_picture: 'avatar.jpg' });
    });

    it('throws on DB error', async () => {
      pool.query.mockRejectedValue(new Error('DB'));
      await expect(Profile.getUserDp('alice')).rejects.toThrow('Error fetching user dp');
    });
  });


  describe('setUserDp', () => {
    it('updates picture and returns rowCount', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });
      const result = await Profile.setUserDp('alice', 'new.jpg');
      expect(result).toBe(1);
    });

    it('throws when user not found', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });
      await expect(Profile.setUserDp('nobody', 'x.jpg')).rejects.toThrow();
    });
  });


  describe('deleteDp', () => {
    it('nulls the picture and returns rowCount', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });
      const result = await Profile.deleteDp('alice');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('NULL'), ['alice']);
      expect(result).toBe(1);
    });
  });


  describe('getUserByName', () => {
    it('returns rows array', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await Profile.getUserByName('alice');
      expect(result).toEqual([{ id: 1 }]);
    });
  });


  describe('getPostsForUser', () => {
    it('returns posts for user', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 10 }, { id: 11 }] });
      const result = await Profile.getPostsForUser(1);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE user_id = $1'), [1]);
      expect(result).toHaveLength(2);
    });
  });


  describe('updatePostForUser', () => {
    it('updates and returns rowCount', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });
      const result = await Profile.updatePostForUser(10, 'New Title', 'Content');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE posts'),
        ['New Title', 'Content', 10]
      );
      expect(result).toBe(1);
    });
  });


  describe('deleteAccount', () => {
    it('deletes account and returns rowCount', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });
      const result = await Profile.deleteAccount('alice');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM users'), ['alice']);
      expect(result).toBe(1);
    });

    it('throws on DB error', async () => {
      pool.query.mockRejectedValue(new Error('DB'));
      await expect(Profile.deleteAccount('alice')).rejects.toThrow('Error deleting user account');
    });
  });

 
  describe('getWorryBox', () => {
    it('returns content row', async () => {
      pool.query.mockResolvedValue({ rows: [{ content: 'my worries' }] });
      const result = await Profile.getWorryBox('alice');
      expect(result).toEqual({ content: 'my worries' });
    });

    it('returns undefined when empty', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      expect(await Profile.getWorryBox('alice')).toBeUndefined();
    });
  });


  describe('setWorryBox', () => {
    it('upserts and returns rowCount', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });
      const result = await Profile.setWorryBox('alice', 'feeling anxious');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT'),
        ['alice', 'feeling anxious']
      );
      expect(result).toBe(1);
    });

    it('throws on DB error', async () => {
      pool.query.mockRejectedValue(new Error('DB'));
      await expect(Profile.setWorryBox('alice', 'x')).rejects.toThrow('Error setting worry box');
    });
  });
});
