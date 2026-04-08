const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const upload = require('../config/multerConfig');

router.get('/bio', profileController.getBio);
router.post('/setBio', profileController.setBio);

router.get('/worry-box', profileController.getWorryBox);
router.post('/worry-box', profileController.setWorryBox);

router.get('/dp', profileController.getDp);
router.post('/setDp', profileController.setDp);
router.delete('/deleteDp', profileController.deleteDp);

router.get('/getPosts', profileController.getPosts);
router.post('/editPost', profileController.updatePosts);
router.post('/deleteAccount', profileController.deleteAccount);

module.exports = router;