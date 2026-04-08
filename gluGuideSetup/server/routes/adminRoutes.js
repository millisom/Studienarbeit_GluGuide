const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Konfiguration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'knowledge-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 1. ERSTELLEN (Nur Admin)
router.post(
  '/admin/knowledge', 
  adminMiddleware, 
  upload.single('knowledgeImage'), 
  adminController.createKnowledgeArticle
);

// 2. LISTEN ANSICHT (Für ALLE geöffnet - adminMiddleware entfernt)
router.get('/admin/knowledge', adminController.listKnowledgeArticles);

// 3. EINZELANSICHT (Für ALLE geöffnet - adminMiddleware entfernt)
router.get('/admin/knowledge/:id', adminController.getSingleKnowledgeArticle);

// 4. BEARBEITEN (Nur Admin)
router.put(
  '/admin/knowledge/:id', 
  adminMiddleware, 
  upload.single('knowledgeImage'), 
  adminController.editKnowledgeArticle
);

// 5. LÖSCHEN (Nur Admin)
router.delete('/admin/knowledge/:id', adminMiddleware, adminController.deleteKnowledgeArticle);


// --- USER MANAGEMENT (Bleibt alles geschützt) ---
router.post('/admin/createUser', adminMiddleware, adminController.createUser);
router.get('/admin/users', adminMiddleware, adminController.listUsers);
router.get('/admin/user/:id', adminMiddleware, adminController.getSingleUser);
router.get('/admin/user/:id/avatar', adminMiddleware, adminController.getUserAvatar);
router.delete('/admin/user/:id', adminMiddleware, adminController.deleteUser);
router.delete('/admin/user/:id/avatar', adminMiddleware, adminController.deleteUserAvatar);
router.put('/admin/user/:id', adminMiddleware, adminController.editUser);

// --- POST & COMMENT MANAGEMENT (Bleibt alles geschützt) ---
router.put('/admin/posts/:id', adminMiddleware, adminController.editPost);
router.delete('/admin/posts/:id', adminMiddleware, adminController.deletePost);
router.put('/admin/comments/:id', adminMiddleware, adminController.editComment);
router.delete('/admin/comments/:id', adminMiddleware, adminController.deleteComment);

module.exports = router;