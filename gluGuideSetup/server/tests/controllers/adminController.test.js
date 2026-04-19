jest.mock('../../config/db', () => ({
  query: jest.fn()
}));

jest.mock('../../models/userModel');
jest.mock('../../models/postModel');

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed_pw'),
  verify: jest.fn().mockResolvedValue(true),
}));

jest.mock('fs', () => ({
  unlink: jest.fn()
}));


const adminController = require('../../controllers/adminController');
const UserModel = require('../../models/userModel');
const Post = require('../../models/postModel');


const mockPool = require('../../config/db');

describe('AdminController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    req = { params: {}, body: {}, session: { userId: 1 }, file: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => jest.restoreAllMocks());


  describe('listUsers', () => {
    it('returns users list (200)', async () => {
      const users = [{ id: 1, username: 'Alice' }];
      UserModel.getAllUsers.mockResolvedValue(users);
      await adminController.listUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(users);
    });

    it('returns 500 on model error', async () => {
      UserModel.getAllUsers.mockRejectedValue(new Error('DB'));
      await adminController.listUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

 
  describe('getSingleUser', () => {
    it('returns user when found', async () => {
      req.params.id = '2';
      UserModel.getUserById.mockResolvedValue({ id: 2, username: 'Bob' });
      await adminController.getSingleUser(req, res);
      expect(res.json).toHaveBeenCalledWith({ id: 2, username: 'Bob' });
    });

    it('returns 404 when user not found', async () => {
      req.params.id = '999';
      UserModel.getUserById.mockResolvedValue(null);
      await adminController.getSingleUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 500 on error', async () => {
      req.params.id = '1';
      UserModel.getUserById.mockRejectedValue(new Error('DB'));
      await adminController.getSingleUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });


  describe('createUser', () => {
    it('creates user and returns 201', async () => {
      req.body = { username: 'Alice', email: 'alice@ex.com', password: 'pass123' };
      mockPool.query
        .mockResolvedValueOnce({ rows: [] })             
        .mockResolvedValueOnce({ rows: [{ id: 5, username: 'Alice', email: 'alice@ex.com', is_admin: false }] }); 

      await adminController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('returns 400 when required fields missing', async () => {
      req.body = { username: 'Alice' };
      await adminController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 409 when email already exists', async () => {
      req.body = { username: 'Alice', email: 'alice@ex.com', password: 'pass' };
      mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      await adminController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });
  });


  describe('editUser', () => {
    it('updates user fields and returns 200', async () => {
      req.params.id = '3';
      req.body = { username: 'NewName', email: 'new@ex.com' };
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ id: 3 }] })      
        .mockResolvedValueOnce({ rows: [{ id: 3, username: 'NewName' }] }); 

      await adminController.editUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 404 when user not found', async () => {
      req.params.id = '999';
      req.body = { username: 'X' };
      mockPool.query.mockResolvedValueOnce({ rows: [] });
      await adminController.editUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 200 with "No updates made" when body is empty', async () => {
      req.params.id = '3';
      req.body = {};
      mockPool.query.mockResolvedValueOnce({ rows: [{ id: 3 }] });
      await adminController.editUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'No updates made.' });
    });
  });


  describe('deleteUser', () => {
    it('deletes user and returns 200', async () => {
      req.params.id = '5';
      req.session.userId = 1;
      UserModel.getUserById.mockResolvedValue({ id: 5 });
      UserModel.deleteUserById.mockResolvedValue(true);

      await adminController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully.' });
    });

    it('returns 403 when admin tries to delete themselves', async () => {
      req.params.id = '1';
      req.session.userId = 1;
      await adminController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('returns 404 when user not found', async () => {
      req.params.id = '99';
      UserModel.getUserById.mockResolvedValue(null);
      await adminController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });


  describe('editPost', () => {
    it('updates post and returns 200', async () => {
      req.params.id = '10';
      req.body = { title: 'New Title', content: 'New Content', tags: 'a,b' };
      Post.getPostById.mockResolvedValue({ id: 10, user_id: 2 });
      Post.updatePost.mockResolvedValue({ id: 10, title: 'New Title' });

      await adminController.editPost(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 400 when title or content missing', async () => {
      req.params.id = '10';
      req.body = { title: '', content: '' };
      await adminController.editPost(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when post not found', async () => {
      req.params.id = '999';
      req.body = { title: 'T', content: 'C' };
      Post.getPostById.mockResolvedValue(null);
      await adminController.editPost(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deletePost', () => {
    it('deletes post and returns 200', async () => {
      req.params.id = '10';
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ id: 10 }] })   
        .mockResolvedValueOnce({ rows: [] });             

      await adminController.deletePost(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 404 when post not found', async () => {
      req.params.id = '999';
      mockPool.query.mockResolvedValueOnce({ rows: [] });
      await adminController.deletePost(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });


  describe('listKnowledgeArticles', () => {
    it('returns articles list (200)', async () => {
      mockPool.query.mockResolvedValue({ rows: [{ id: 1 }] });
      await adminController.listKnowledgeArticles(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 500 on error', async () => {
      mockPool.query.mockRejectedValue(new Error('DB'));
      await adminController.listKnowledgeArticles(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });


  describe('getSingleKnowledgeArticle', () => {
    it('returns article when found', async () => {
      req.params.id = '1';
      mockPool.query.mockResolvedValue({ rows: [{ id: 1, title_en: 'Test' }] });
      await adminController.getSingleKnowledgeArticle(req, res);
      expect(res.json).toHaveBeenCalledWith({ id: 1, title_en: 'Test' });
    });

    it('returns 404 when article not found', async () => {
      req.params.id = '99';
      mockPool.query.mockResolvedValue({ rows: [] });
      await adminController.getSingleKnowledgeArticle(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('editComment', () => {
    it('updates comment and returns 200', async () => {
      req.params.id = '7';
      req.body.content = 'Updated content';
      mockPool.query.mockResolvedValue({ rows: [{ id: 7, content: 'Updated content' }] });
      await adminController.editComment(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 404 when comment not found', async () => {
      req.params.id = '999';
      mockPool.query.mockResolvedValue({ rows: [] });
      await adminController.editComment(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

 
  describe('deleteComment', () => {
    it('deletes comment and returns 200', async () => {
      req.params.id = '7';
      mockPool.query.mockResolvedValue({ rows: [{ id: 7 }] });
      await adminController.deleteComment(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 404 when comment not found', async () => {
      req.params.id = '999';
      mockPool.query.mockResolvedValue({ rows: [] });
      await adminController.deleteComment(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});