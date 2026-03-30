const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController'); 

// Define the route for creating a post
router.post('/createPost', postController.createPost); 
router.get('/getUserPost', postController.getUserPost); 
router.get('/getUserPost/:id', postController.getPostById);
router.put('/updatePost/:id', postController.updatePost);
router.delete('/deletePost/:id', postController.deletePost);
router.get('/getAllPosts', postController.getAllPosts);
router.post('/uploadPostImage/:id', postController.uploadPostImage);
router.delete('/deletePostImage/:id', postController.deletePostImage);

// Route to get all unique tags
router.get('/tags', postController.getAllTags);

// Route to like or unlike a post
router.post('/toggleLike/:id', postController.toggleLike);

// Route for Admin to edit specific post
router.get('/getPost/:id', postController.getPostById);

//Router for author profile
router.get('/profile/:username', postController.getAuthorProfile);


module.exports = router;
