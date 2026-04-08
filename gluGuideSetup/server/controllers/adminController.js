const argon2 = require('argon2');
const pool = require('../config/db');
const fs = require("fs");
const path = require("path");
const Post = require('../models/postModel');
const UserModel = require('../models/userModel');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

const adminController = {

  listUsers: async (req, res) => {
    try {
      const users = await UserModel.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      console.error("Error retrieving users:", err);
      res.status(500).json({ error: "Server error retrieving users." });
    }
  },

  getSingleUser: async (req, res) => {
    const userId = req.params.id;
    try {
      const user = await UserModel.getUserById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json(user);
    } catch (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Server error" });
    }
  },

  getUserAvatar: async (req, res) => {
    const userId = req.params.id;
    try {
      const result = await pool.query(`SELECT profile_picture FROM users WHERE id = $1`, [userId]);
      if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
      const { profile_picture } = result.rows[0];
      if (!profile_picture) return res.json({ url: "" });
      const url = `${BASE_URL}/uploads/${profile_picture}`;
      return res.json({ url });
    } catch (err) {
      console.error("Error fetching user avatar:", err);
      return res.status(500).json({ error: "Server error" });
    }
  },

  createUser: async (req, res) => {
    const { username, email, password, termsAccepted, is_admin } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required." });
    }
    try {
      const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (existingUser.rows.length > 0) return res.status(409).json({ error: "User already exists." });
      const hashedPassword = await argon2.hash(password);
      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, terms_accepted, is_admin)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, is_admin`,
        [username, email, hashedPassword, termsAccepted || false, is_admin || false]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Error creating new user:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  editUser: async (req, res) => {
    const userId = req.params.id;
    const { username, email, is_admin, newPassword, profile_bio } = req.body;
    try {
      const existingUser = await pool.query("SELECT * FROM users WHERE id=$1", [userId]);
      if (existingUser.rows.length === 0) return res.status(404).json({ error: "User not found." });
      let i = 1;
      const updates = [];
      const values = [];
      if (username !== undefined) { updates.push(`username = $${i}`); values.push(username); i++; }
      if (email !== undefined) { updates.push(`email = $${i}`); values.push(email); i++; }
      if (is_admin !== undefined) { updates.push(`is_admin = $${i}`); values.push(is_admin); i++; }
      if (profile_bio !== undefined) { updates.push(`profile_bio = $${i}`); values.push(profile_bio); i++; }
      if (newPassword && newPassword.trim()) {
        const hashedPassword = await argon2.hash(newPassword);
        updates.push(`password_hash = $${i}`); values.push(hashedPassword); i++;
      }
      if (updates.length === 0) return res.status(200).json({ message: "No updates made." });
      const query = `UPDATE users SET ${updates.join(", ")} WHERE id = $${i} RETURNING id, username, email, is_admin, profile_bio`;
      values.push(userId);
      const updated = await pool.query(query, values);
      return res.status(200).json(updated.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: "Server error editing user." });
    }
  },

  deleteUserAvatar: async (req, res) => {
    const userId = req.params.id;
    try {
      const userResult = await pool.query("SELECT profile_picture FROM users WHERE id=$1", [userId]);
      if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found." });
      const { profile_picture } = userResult.rows[0];
      if (!profile_picture) return res.status(400).json({ error: "User has no avatar." });
      await pool.query("UPDATE users SET profile_picture=null WHERE id=$1", [userId]);
      const fullPath = path.join(__dirname, "..", "uploads", profile_picture);
      fs.unlink(fullPath, (err) => { if (err) console.error("File deletion failed:", err); });
      return res.status(200).json({ message: "User avatar deleted successfully." });
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  },

  deleteUser: async (req, res) => {
    const userIdToDelete = req.params.id;
    const loggedInUserId = req.session.userId;
    try {
      if (parseInt(userIdToDelete, 10) === loggedInUserId) return res.status(403).json({ error: "You cannot delete yourself!" });
      const existingUser = await UserModel.getUserById(userIdToDelete);
      if (!existingUser) return res.status(404).json({ error: "User not found." });
      await UserModel.deleteUserById(userIdToDelete);
      res.status(200).json({ message: "User deleted successfully." });
    } catch (err) {
      res.status(500).json({ error: "Server error deleting user." });
    }
  },


  editPost: async (req, res) => {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    let tagsArray = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []);
    if (!title || !content) return res.status(400).json({ message: "Title and content are required." });
    try {
      const postToUpdate = await Post.getPostById(id);
      if (!postToUpdate) return res.status(404).json({ message: "Post not found." });
      const updatedPost = await Post.updatePost(id, postToUpdate.user_id, title, content, tagsArray);
      return res.status(200).json({ message: "Post updated successfully", post: updatedPost });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  deletePost: async (req, res) => {
    const postId = req.params.id;
    try {
      const existingPost = await pool.query("SELECT * FROM posts WHERE id = $1", [postId]);
      if (existingPost.rows.length === 0) return res.status(404).json({ error: "Post not found." });
      await pool.query("DELETE FROM posts WHERE id = $1", [postId]);
      res.status(200).json({ message: "Post deleted successfully." });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  },

  listKnowledgeArticles: async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM knowledge_articles ORDER BY created_at DESC");
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Error listing articles" });
    }
  },

  createKnowledgeArticle: async (req, res) => {
    const { category_de, category_en, tags, title_en, summary_en, content_en, title_de, summary_de, content_de } = req.body;
    const image_url = req.file ? req.file.filename : null;
    
    let tagsArray = [];
    try {
      tagsArray = typeof tags === 'string' ? JSON.parse(tags) : (Array.isArray(tags) ? tags : []);
    } catch (e) {
      tagsArray = [];
    }

    try {
      const result = await pool.query(
        `INSERT INTO knowledge_articles 
        (category_de, category_en, image_url, tags, title_en, summary_en, content_en, title_de, summary_de, content_de)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [category_de, category_en, image_url, tagsArray, title_en, summary_en, content_en, title_de, summary_de, content_de]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Create Article Error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  editKnowledgeArticle: async (req, res) => {
    const { id } = req.params;
    const { category_de, category_en, tags, title_en, summary_en, content_en, title_de, summary_de, content_de } = req.body;
    
    let tagsArray = [];
    try {
      tagsArray = typeof tags === 'string' ? JSON.parse(tags) : (Array.isArray(tags) ? tags : []);
    } catch (e) {
      tagsArray = [];
    }

    try {
      let image_url = req.file ? req.file.filename : req.body.image_url;

      const result = await pool.query(
        `UPDATE knowledge_articles SET 
          category_de=$1, category_en=$2, image_url=$3, tags=$4, 
          title_en=$5, summary_en=$6, content_en=$7, 
          title_de=$8, summary_de=$9, content_de=$10, 
          updated_at=NOW()
        WHERE id=$11 RETURNING *`,
        [category_de, category_en, image_url, tagsArray, title_en, summary_en, content_en, title_de, summary_de, content_de, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: "Article not found" });
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Edit Article Error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  deleteKnowledgeArticle: async (req, res) => {
    const { id } = req.params;
    try {
      const article = await pool.query("SELECT image_url FROM knowledge_articles WHERE id=$1", [id]);
      if (article.rows.length > 0 && article.rows[0].image_url) {
        const filePath = path.join(__dirname, "..", "uploads", article.rows[0].image_url);
        fs.unlink(filePath, (err) => { if (err) console.error("Image delete failed:", err); });
      }

      await pool.query("DELETE FROM knowledge_articles WHERE id=$1", [id]);
      res.status(200).json({ message: "Article deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Server error deleting article" });
    }
  },

  getSingleKnowledgeArticle: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query("SELECT * FROM knowledge_articles WHERE id=$1", [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Article not found" });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  },


  editComment: async (req, res) => {
    const commentId = req.params.id;
    const { content } = req.body;
    try {
      const updatedComment = await pool.query(
        `UPDATE comments SET content = COALESCE($1, content), updated_at = NOW()
         WHERE id = $2 RETURNING id, content, updated_at`,
        [content, commentId]
      );
      if (updatedComment.rows.length === 0) return res.status(404).json({ error: "Comment not found." });
      res.status(200).json(updatedComment.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  },

  deleteComment: async (req, res) => {
    const commentId = req.params.id;
    try {
      const result = await pool.query("DELETE FROM comments WHERE id = $1 RETURNING *", [commentId]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Comment not found." });
      res.status(200).json({ message: "Comment deleted successfully." });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
};

module.exports = adminController;