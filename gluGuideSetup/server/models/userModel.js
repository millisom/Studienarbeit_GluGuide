const pool = require('../config/db');

const UserModel = {
  async getAllUsers() {
    const query = `
      SELECT id, username, email, created_at, is_admin, profile_bio, profile_picture
      FROM users
      ORDER BY created_at DESC
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error('Error fetching users: ' + error.message);
    }
  },


  async getUserById(id) {
    const query = 'SELECT id, username, email, is_admin, profile_bio FROM users WHERE id = $1';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Error fetching user by ID: ' + error.message);
    }
  },


async deleteUserById(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN'); 

      await client.query('DELETE FROM meals WHERE user_id = $1', [id]);
      await client.query('DELETE FROM glucose_logs WHERE user_id = $1', [id]);
      await client.query('DELETE FROM posts WHERE user_id = $1', [id]);
      await client.query('DELETE FROM comments WHERE author_id = $1', [id]);
      await client.query('DELETE FROM alerts WHERE user_id = $1', [id]);
      await client.query('DELETE FROM recipe_logs WHERE user_id = $1', [id]);


 
      const query = 'DELETE FROM users WHERE id = $1';
      await client.query(query, [id]);

      await client.query('COMMIT'); 
    } catch (error) {
      await client.query('ROLLBACK'); 
      throw new Error('Error deleting user: ' + error.message);
    } finally {
      client.release(); 
    }
  }
};

module.exports = UserModel;