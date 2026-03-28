const setUserIdInSession = require('../../middleware/sessionMiddleware');
const glucoseRoutes = require('../../routes/glucoseRoutes');
const foodItemRoutes = require('../../routes/foodItemRoutes');
const recipeRoutes = require('../../routes/recipeRoutes');
const mealRoutes = require('../../routes/mealRoutes');
const alertRoutes = require('../../routes/alertRoutes');
const notificationRoutes = require('../../routes/notificationRoutes'); 

/**
 * Setup health management routes (glucose, food, recipes, meals, alerts, notifications)
 * @param {Object} app - Express app
 */
const setupHealthRoutes = (app) => {
  app.use('/glucose', glucoseRoutes);
  app.use('/food', foodItemRoutes);
  app.use('/recipes', setUserIdInSession, recipeRoutes);
  app.use('/meal', mealRoutes);
  app.use('/', alertRoutes);
  app.use('/', notificationRoutes); 
};

module.exports = setupHealthRoutes;