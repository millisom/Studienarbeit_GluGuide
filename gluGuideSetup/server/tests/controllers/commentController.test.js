const commentController = require('../../controllers/commentController');
const Comment = require('../../models/commentModel');

// Model mocken
jest.mock('../../models/commentModel');

describe('Comment Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        // Console.error unterdrücken für saubere Test-Logs
        jest.spyOn(console, 'error').mockImplementation(() => {});

        req = {
            session: { username: 'testuser' },
            body: {},
            params: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    describe('createComment', () => {
        it('sollte einen Kommentar erfolgreich erstellen (200)', async () => {
            req.body = { post_id: 1, content: 'Toller Beitrag!' };
            Comment.getUserIdByUsername.mockResolvedValue(10);
            Comment.createComment.mockResolvedValue({ id: 100, content: 'Toller Beitrag!' });

            await commentController.createComment(req, res);

            expect(Comment.createComment).toHaveBeenCalledWith(1, 10, 'Toller Beitrag!');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('sollte 401 zurückgeben, wenn kein Username in der Session ist', async () => {
            req.session.username = null;
            await commentController.createComment(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('sollte 404 zurückgeben, wenn der User nicht gefunden wird', async () => {
            Comment.getUserIdByUsername.mockResolvedValue(null);
            await commentController.createComment(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('getComments', () => {
        it('sollte Kommentare für einen Post zurückgeben', async () => {
            req.params.post_id = '1';
            const mockComments = [{ id: 1, content: 'Hi' }];
            Comment.getCommentsByPostId.mockResolvedValue(mockComments);
            Comment.getUserIdByUsername.mockResolvedValue(10);

            await commentController.getComments(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                comments: mockComments,
                currentUserId: 10
            });
        });
    });

    describe('deleteComment', () => {
        it('sollte 200 zurückgeben, wenn der Besitzer den Kommentar löscht', async () => {
            req.params.commentId = '100';
            Comment.getUserIdByUsername.mockResolvedValue(10);
            Comment.getCommentById.mockResolvedValue({ id: 100, author_id: 10 });
            Comment.deleteCommentById.mockResolvedValue(true);

            await commentController.deleteComment(req, res);

            expect(Comment.deleteCommentById).toHaveBeenCalledWith('100');
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('sollte 403 zurückgeben, wenn jemand anderes versucht zu löschen', async () => {
            req.params.commentId = '100';
            Comment.getUserIdByUsername.mockResolvedValue(10);
            // Kommentar gehört User 99, nicht User 10
            Comment.getCommentById.mockResolvedValue({ id: 100, author_id: 99 });

            await commentController.deleteComment(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(Comment.deleteCommentById).not.toHaveBeenCalled();
        });
    });

    describe('editComment', () => {
        it('sollte den Kommentar bearbeiten, wenn der Author identisch ist', async () => {
            req.params.commentId = '100';
            req.body.content = 'Update';
            Comment.getUserIdByUsername.mockResolvedValue(10);
            Comment.getCommentById.mockResolvedValue({ id: 100, author_id: 10 });
            Comment.updateCommentById.mockResolvedValue({ id: 100, content: 'Update' });

            await commentController.editComment(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(Comment.updateCommentById).toHaveBeenCalledWith('100', 'Update');
        });
    });

    describe('Like/Dislike Toggle', () => {
        it('toggleLike sollte neue Werte zurückgeben', async () => {
            req.params.id = '100';
            Comment.toggleLike.mockResolvedValue({ likes: 5, dislikes: 1 });

            await commentController.toggleLike(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, likes: 5, dislikes: 1 });
        });

        it('toggleDislike sollte neue Werte zurückgeben', async () => {
            req.params.id = '100';
            Comment.toggleDislike.mockResolvedValue({ likes: 2, dislikes: 10 });

            await commentController.toggleDislike(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, likes: 2, dislikes: 10 });
        });
    });
});