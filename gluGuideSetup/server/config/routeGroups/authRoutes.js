const authRoutes = require('../../routes/authRoutes');
const profileRoutes = require('../../routes/profileRoutes');

/**
 * Setup authentication and profile related routes
 * @param {Object} app - Express app
 */
const setupAuthRoutes = (app) => {
  app.use('/', authRoutes);
  app.use('/', profileRoutes);
  
  // ADD LOGOUT HERE
  app.post('/logout', (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ error: "Could not log out" });
        }
        res.clearCookie('connect.sid', { path: '/' }); 
        return res.status(200).json({ message: "Logout successful" });
      });
    } else {
      res.status(200).json({ message: "Already logged out" });
    }
  });

  // Current user endpoint
  app.get('/currentUser', (req, res) => {
    if (req.session && req.session.userId) {
      return res.status(200).json({ userId: req.session.userId });
    }
    res.status(401).json({ message: 'User not logged in' });
  });
};

module.exports = setupAuthRoutes;