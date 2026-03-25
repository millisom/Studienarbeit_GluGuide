const Meal = require('../models/mealModel');
const Recipe = require('../models/recipeModel');

const mealController = {

  async createMeal(req, res, next) {
    try {
      // 1. Destructure exactly what the frontend sends, including the new request_reminder
      const { 
        meal_type, 
        meal_time, 
        notes, 
        items = [], 
        recipe_id = null, 
        quantity = 1,        
        recipe_quantity,
        request_reminder  // 👈 NEW: Capturing the checkbox value
      } = req.body;

      // Use Number() to ensure math works
      const multiplier = Number(quantity || recipe_quantity || 1);
      const user_id = req.session.userId;

      console.log(`--- Logging Meal: ${meal_type} ---`);
      console.log(`Multiplier detected: ${multiplier}`);
      console.log(`Reminder Requested: ${request_reminder}`);

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
          // SCALE THE INGREDIENTS
          const scaledIngredients = recipe.ingredients.map(ing => {
            const baseGrams = Number(ing.quantity_in_grams) || 100;
            const scaledGrams = baseGrams * multiplier;
            
            console.log(`Scaling ${ing.name}: ${baseGrams}g x ${multiplier} = ${scaledGrams}g`);
            
            return {
              food_id: ing.food_id,
              name: ing.name,
              quantity_in_grams: scaledGrams
            };
          });

          finalItemsToSave = [...finalItemsToSave, ...scaledIngredients];
        }
      }

      // 2. Create the meal record
      const meal = await Meal.createMeal(
        user_id,
        meal_type,
        meal_time,
        notes,
        recipe_id,
        finalItemsToSave, 
        recipeSnapshot
      );

      // 3. Save to junction table
      for (const item of finalItemsToSave) {
        console.log(`Saving to DB: FoodID ${item.food_id} | ${item.quantity_in_grams}g`);
        await Meal.addFoodToMeal(
          meal.meal_id, 
          item.food_id, 
          item.quantity_in_grams
        );
      }

      // 4. Update the totals in the meals table
      const updatedMeal = await Meal.updateMealNutrition(meal.meal_id);

      // ==========================================
      // 5. 💉 GESTATIONAL DIABETES: 1-HOUR MEAL TIMER
      // ==========================================
      if (request_reminder === true) {
        const mealTimeMs = new Date(meal_time).getTime();
        const oneHourLater = mealTimeMs + (60 * 60 * 1000); // Add 1 hour in milliseconds
        const timeUntilAlert = oneHourLater - Date.now();

        // Only set the timer if the meal is happening now or in the future
        if (timeUntilAlert > 0) {
          setTimeout(() => {
            console.log(`⏰ [ALERT] Triggering 1-hour glucose check email for User ${user_id} (Meal ${meal.meal_id})`);
            
            // TODO: Call your existing email function here!
            // sendEmailAlert(user_id, "Time to check your blood sugar!", `It has been exactly 1 hour since your ${meal_type}. Please log your glucose.`);
            
          }, timeUntilAlert);
        } else {
          console.log("Meal time was too far in the past to set a 1-hour backend reminder.");
        }
      }
      // ==========================================

      console.log(`Final Calories Saved: ${updatedMeal.total_calories}`);
      console.log(`--- Log Complete ---`);

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