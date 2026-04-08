const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Konfiguration für den Upload von Bildern in der Wissensdatenbank
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Sicherstellen, dass dieser Ordner existiert
  },
  filename: (req, file, cb) => {
    // Eindeutiger Dateiname: knowledge-Zeitstempel-Originalname
    cb(null, 'knowledge-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Knowledge Article management routes
// Wir fügen upload.single('knowledgeImage') hinzu, um das Bild aus dem FormData zu verarbeiten
router.post(
  '/admin/knowledge', 
  adminMiddleware, 
  upload.single('knowledgeImage'), 
  adminController.createKnowledgeArticle
);

router.get('/admin/knowledge', adminMiddleware, adminController.listKnowledgeArticles);
router.get('/admin/knowledge/:id', adminMiddleware, adminController.getSingleKnowledgeArticle);

router.put(
  '/admin/knowledge/:id', 
  adminMiddleware, 
  upload.single('knowledgeImage'), 
  adminController.editKnowledgeArticle
);

router.delete('/admin/knowledge/:id', adminMiddleware, adminController.deleteKnowledgeArticle);

// User management routes
router.post('/admin/createUser', adminMiddleware, adminController.createUser);
router.get('/admin/users', adminMiddleware, adminController.listUsers);
router.get('/admin/user/:id', adminMiddleware, adminController.getSingleUser);
router.get(
  '/admin/user/:id/avatar',
  adminMiddleware,
  adminController.getUserAvatar
);
router.delete('/admin/user/:id', adminMiddleware, adminController.deleteUser);
router.delete(
  '/admin/user/:id/avatar',
  adminMiddleware,
  adminController.deleteUserAvatar
);
router.put('/admin/user/:id', adminMiddleware, adminController.editUser);

// Post management routes
router.put('/admin/posts/:id', adminMiddleware, adminController.editPost);
router.delete('/admin/posts/:id', adminMiddleware, adminController.deletePost);

// Comment management routes
router.put('/admin/comments/:id', adminMiddleware, adminController.editComment);
router.delete(
  '/admin/comments/:id',
  adminMiddleware,
  adminController.deleteComment
);

module.exports = router;