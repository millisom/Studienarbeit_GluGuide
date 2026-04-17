const Recipe = require('../models/recipeModel');


const verifyRecipeOwner = async (req, res, next) => {
  try {
    const user_id = req.session?.userId;
    if (!user_id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const recipeId = parseInt(req.params.id, 10);
    if (Number.isNaN(recipeId)) {
      return res.status(400).json({ message: 'Invalid recipe id' });
    }

    const recipe = await Recipe.getRecipeById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (String(recipe.user_id) !== String(user_id)) {
      return res.status(403).json({ message: 'You are not allowed to access this recipe' });
    }


    req.recipe = recipe;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyRecipeOwner };