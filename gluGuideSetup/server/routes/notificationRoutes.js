const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

const setUserIdInSession = require('../middleware/sessionMiddleware'); 

router.get('/notifications/unread', setUserIdInSession, notificationController.getUnread);
router.put('/notifications/:id/read', setUserIdInSession, notificationController.markRead);

module.exports = router;