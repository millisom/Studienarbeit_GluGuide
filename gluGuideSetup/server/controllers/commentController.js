const Comment = require('../models/commentModel');

const commentController = {

    async createComment(req, res) {
        const { post_id, content } = req.body; 
        const username = req.session?.username;

        if (!username) {
            return res.status(401).send('Unauthorized');
        }

        try {
    
            const userId = await Comment.getUserIdByUsername(username);
            if (!userId) {
                return res.status(404).json({ error: 'User not found' });
            }

            const newComment = await Comment.createComment(post_id, userId, content);
            return res.status(200).json({ success: true, comment: newComment });
        } catch (error) {
            console.error('Error creating comment:', error.message);
            res.status(500).json({ success: false, message: 'Failed to create comment.' });
        }
    },



        async getComments(req, res) {
        const { post_id } = req.params;

        try {
            const comments = await Comment.getCommentsByPostId(post_id);
            const username = req.session?.username;
            const currentUserId = await Comment.getUserIdByUsername(username);
            res.status(200).json({ comments,  currentUserId});
        } catch (error) {
            console.error('Error fetching comments:', error.message);
            res.status(500).json({ success: false, message: 'Failed to fetch comments.' });
        }
    },


    async deleteComment(req, res) {
        const { commentId } = req.params;
        const username = req.session?.username;

        if (!username) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            const userId = await Comment.getUserIdByUsername(username);
            if (!userId) {
                return res.status(404).json({ message: 'User not found' });
            }

 
            const comment = await Comment.getCommentById(commentId);
            if (!comment || comment.author_id !== userId) {
                return res.status(403).json({ message: 'You can only delete your own comments' });
            }


            await Comment.deleteCommentById(commentId);
            res.status(200).json({ success: true, message: 'Comment deleted successfully' });
        } catch (error) {
            console.error('Error deleting comment:', error.message);
            res.status(500).json({ success: false, message: 'Failed to delete comment' });
        }
    },
    async toggleLike(req, res) {
        const { id: commentId } = req.params;

        try {
          const { likes, dislikes } = await Comment.toggleLike(commentId);
          res.status(200).json({ success: true, likes, dislikes });
        } catch (error) {
          console.error('Error toggling like:', error.message);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      },

    async toggleDislike(req, res) {
        const { id: commentId } = req.params;

        try {
            const { likes, dislikes } = await Comment.toggleDislike(commentId);
            res.status(200).json({ success: true, likes, dislikes });
        } catch (error) {
            console.error('Error toggling dislike:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },


    async editComment(req, res) {
        const { commentId } = req.params;
        const { content } = req.body; // New content for the comment
        const username = req.session?.username;

        if (!username) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {

            const userId = await Comment.getUserIdByUsername(username);
            if (!userId) {
                return res.status(404).json({ message: 'User not found' });
            }


            const comment = await Comment.getCommentById(commentId);
            if (!comment || comment.author_id !== userId) {
                return res.status(403).json({ message: 'You can only edit your own comments' });
            }


            const updatedComment = await Comment.updateCommentById(commentId, content);
            res.status(200).json({ success: true, comment: updatedComment });
        } catch (error) {
            console.error('Error editing comment:', error.message);
            res.status(500).json({ success: false, message: 'Failed to edit comment' });
        }
    },
}
module.exports = commentController;
