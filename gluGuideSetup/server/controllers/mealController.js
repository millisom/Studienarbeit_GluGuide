const Meal = require('../models/mealModel');
const Recipe = require('../models/recipeModel');
const Alert = require('../models/alertModel');

const mealController = {

  async createMeal(req, res, next) {
    try {
      const { 
        meal_type, 
        meal_time, 
        notes, 
        items = [], 
        recipe_id = null, 
        quantity = 1,        
        recipe_quantity,
        request_reminder
      } = req.body;

      const multiplier = Number(quantity || recipe_quantity || 1);
      const user_id = req.session.userId;

      if (!user_id || !meal_type) {
        return res.status(400).json({ message: 'user_id and meal_type are required' });
      }

      let finalItemsToSave = [...items]; 
      let recipeSnapshot = null;

      if (recipe_id) {
        const recipe = await Recipe.getRecipeById(recipe_id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

        recipeSnapshot = recipe;

        if (Array.isArray(recipe.ingredients)) {
          const scaledIngredients = recipe.ingredients.map(ing => {
            const baseGrams = Number(ing.quantity_in_grams) || 100;
            const scaledGrams = baseGrams * multiplier;
            return {
              food_id: ing.food_id,
              name: ing.name,
              quantity_in_grams: scaledGrams
            };
          });
          finalItemsToSave = [...finalItemsToSave, ...scaledIngredients];
        }
      }


      const meal = await Meal.createMeal(
        user_id, meal_type, meal_time, notes,
        recipe_id, finalItemsToSave, recipeSnapshot
      );


      for (const item of finalItemsToSave) {
        await Meal.addFoodToMeal(meal.meal_id, item.food_id, item.quantity_in_grams);
      }


      const updatedMeal = await Meal.updateMealNutrition(meal.meal_id);


      if (request_reminder === true) {
        const mealTimeMs = new Date(meal_time).getTime();
        const oneHourLater = new Date(mealTimeMs + (60 * 60 * 1000));


        if (oneHourLater.getTime() > Date.now()) {
          await Alert.createMealReminder(
            user_id,
            meal.meal_id,
            meal_type,
            oneHourLater
          );
          console.log(`[REMINDER] Scheduled 1h post-meal check for User ${user_id}, Meal ${meal.meal_id} at ${oneHourLater.toISOString()}`);
        }
      }


      res.status(201).json(updatedMeal);
    } catch (error) {
      console.error("Backend Save Error:", error);
      next(error);
    }
  },

  async getMealById(req, res, next) {
    try {
      const meal_id = parseInt(req.params.id);
      const meal = await Meal.getMealById(meal_id);
      if (!meal) {
        return res.status(404).json({ message: 'Meal not found' });
      }
      const items = await Meal.getMealFoodItems(meal_id);
      res.status(200).json({ ...meal, items });
    } catch (error) {
      next(error);
    }
  },

  async getMealsByUser(req, res, next) {
    try {
      const user_id = req.session.userId;
      if (!user_id) {
        return res.status(400).json({ message: 'user_id is required in session' });
      }
      const meals = await Meal.getMealsByUser(user_id);
      res.status(200).json(meals);
    } catch (error) {
      next(error);
    }
  },

  async updateMealNutrition(req, res, next) {
    try {
      const meal_id = parseInt(req.params.id);
      const updatedMeal = await Meal.updateMealNutrition(meal_id);
      res.status(200).json(updatedMeal);
    } catch (error) {
      next(error);
    }
  },

  async updateMeal(req, res, next) {
    try {
      const meal_id = parseInt(req.params.id);
      const user_id = req.session.userId;
      const { meal_time, items } = req.body;

      if (!user_id) return res.status(401).json({ message: 'Unauthorized' });

      const existingMeal = await Meal.getMealById(meal_id);
      if (!existingMeal) return res.status(404).json({ message: 'Meal not found' });
      if (existingMeal.user_id !== user_id) return res.status(403).json({ message: 'Forbidden' });

      await Meal.updateMealDetails(meal_id, meal_time);

      if (items && items.length > 0) {
        await Meal.clearMealItems(meal_id);
        for (const item of items) {
          const gramAmount = Number(item.quantity_in_grams);
          if (gramAmount > 0) {
            await Meal.addFoodToMeal(meal_id, item.food_id, gramAmount);
          }
        }
      }

      const updatedMeal = await Meal.updateMealNutrition(meal_id);
      res.status(200).json(updatedMeal);
    } catch (error) {
      console.error("Backend Update Error:", error);
      next(error);
    }
  },

  async deleteMeal(req, res, next) {
    try {
      const meal_id = parseInt(req.params.id);
      await Meal.deleteMeal(meal_id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = mealController;
