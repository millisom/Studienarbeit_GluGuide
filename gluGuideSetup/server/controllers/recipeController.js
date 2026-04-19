const Recipe = require('../models/recipeModel');
const calculateTotalNutrition = require('../helpers/nutritionHelper');

const recipeController = {


  async getAllRecipes(req, res, next) {
    try {
      const user_id = req.session.userId;
      if (!user_id) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      const recipes = await Recipe.getAllRecipesByUser(user_id);
      res.status(200).json(recipes);
    } catch (error) {
      next(error);
    }
  },


  async getRecipeById(req, res, next) {
    try {
      res.status(200).json(req.recipe);
    } catch (error) {
      next(error);
    }
  },

  async getRecipeByName(req, res, next) {
    try {
      const user_id = req.session.userId;
      if (!user_id) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const name = req.query.name?.toLowerCase();
      if (!name) {
        return res.status(400).json({ message: 'Recipe name is required' });
      }

      const recipes = await Recipe.getRecipeByName(user_id, name);

      if (!recipes || recipes.length === 0) {
        return res.status(404).json({ message: 'No recipes found' });
      }

      res.status(200).json(recipes);
    } catch (error) {
      next(error);
    }
  },

  async createRecipe(req, res, next) {
    try {
      const user_id = req.session.userId;
      if (!user_id) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { name, ingredients = [], instructions = [] } = req.body;
      const created_at = new Date();

      if (!name || !Array.isArray(ingredients) || !Array.isArray(instructions)) {
        return res.status(400).json({
          message: 'name, ingredients, and instructions are required'
        });
      }

      const newRecipe = await Recipe.createRecipe(
        user_id,
        name,
        ingredients,
        instructions,
        created_at
      );

      res.status(201).json(newRecipe);
    } catch (error) {
      if (error.message.includes('Food item')) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  },


  async updateRecipe(req, res, next) {
    try {
      const user_id = req.session.userId;
      const id = parseInt(req.params.id, 10);
      const { name, ingredients, instructions } = req.body;
      const updated_at = new Date();

      const updatedRecipe = await Recipe.updateRecipe(
        id, user_id, name, ingredients, instructions, updated_at
      );

      if (!updatedRecipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      res.status(200).json(updatedRecipe);
    } catch (error) {
      if (error.message.includes('Food item')) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  },


  async deleteRecipe(req, res, next) {
    try {
      const user_id = req.session.userId;
      const id = parseInt(req.params.id, 10);

      const deletedRecipe = await Recipe.deleteRecipe(id, user_id);
      if (!deletedRecipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async logRecipe(req, res, next) {
    try {
      const { recipe_id, action } = req.body;
      const user_id = req.session.userId;
      const timestamp = new Date();

      if (!recipe_id || !user_id || !action) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const ingredients = await Recipe.getRecipeIngredients(recipe_id);
      if (!ingredients || ingredients.length === 0) {
        return res.status(404).json({ message: 'Recipe ingredients not found' });
      }

      const totalNutrition = await calculateTotalNutrition(ingredients);

      const loggedRecipe = await Recipe.logRecipe(user_id, recipe_id, action, timestamp, totalNutrition);
      if (!loggedRecipe) {
        return res.status(500).json({ message: 'Failed to log recipe' });
      }

      res.status(201).json(loggedRecipe);
    } catch (error) {
      next(error);
    }
  },

  async getRecipeLogs(req, res, next) {
    try {
      const user_id = req.session.userId;

      if (!user_id) {
        return res.status(400).json({ message: 'User ID is required in URL' });
      }

      const logs = await Recipe.getRecipeLogs(user_id);
      res.status(200).json(logs);
    } catch (error) {
      next(error);
    }
  },

  async deleteRecipeLog(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);

      if (!id) {
        return res.status(400).json({ message: 'Log ID is required in URL' });
      }

      const deletedLog = await Recipe.deleteRecipeLog(id);
      if (!deletedLog) {
        return res.status(404).json({ message: 'Log not found' });
      }

      res.status(200).json({ message: 'Log deleted successfully', deletedLog });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = recipeController;