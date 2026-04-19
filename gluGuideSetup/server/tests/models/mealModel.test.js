const Meal = require('../../models/mealModel');
const pool = require('../../config/db');

jest.mock('../../config/db', () => ({ query: jest.fn() }));
jest.mock('../../helpers/nutritionHelper', () =>
  jest.fn().mockResolvedValue({ totalCalories: 100, totalProteins: 5, totalFats: 3, totalCarbs: 15 })
);

describe('MealModel', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createMeal', () => {
    it('inserts meal and returns row', async () => {
      const row = { meal_id: 1, user_id: 1, meal_type: 'lunch' };
      pool.query.mockResolvedValue({ rows: [row] });
      const result = await Meal.createMeal(1, 'lunch', new Date(), 'notes', null, null, null);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO meals'), expect.any(Array));
      expect(result).toEqual(row);
    });
  });

  describe('getMealById', () => {
    it('returns meal by id', async () => {
      pool.query.mockResolvedValue({ rows: [{ meal_id: 5 }] });
      const result = await Meal.getMealById(5);
      expect(result).toEqual({ meal_id: 5 });
    });

    it('returns undefined when not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const result = await Meal.getMealById(999);
      expect(result).toBeUndefined();
    });
  });

  describe('getMealsByUser', () => {
    it('returns list of meals', async () => {
      pool.query.mockResolvedValue({ rows: [{ meal_id: 1 }, { meal_id: 2 }] });
      const result = await Meal.getMealsByUser(1);
      expect(result).toHaveLength(2);
    });
  });

  describe('getMealFoodItems', () => {
    it('returns food items for meal', async () => {
      pool.query.mockResolvedValue({ rows: [{ food_id: 10, quantity_in_grams: 150 }] });
      const result = await Meal.getMealFoodItems(1);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('JOIN foods'), [1]);
      expect(result).toHaveLength(1);
    });
  });

  describe('updateMealNutrition', () => {
    it('recalculates and updates nutrition', async () => {

      pool.query
        .mockResolvedValueOnce({ rows: [{ food_id: 1, quantity_in_grams: 100 }] }) 
        .mockResolvedValueOnce({ rows: [{ meal_id: 1, total_calories: 100 }] });   

      const result = await Meal.updateMealNutrition(1);
      expect(result).toEqual({ meal_id: 1, total_calories: 100 });
    });
  });

  describe('addFoodToMeal', () => {
    it('inserts food into meal', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      await Meal.addFoodToMeal(1, 10, 150);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO meal_food_items'), [1, 10, 150]);
    });
  });

  describe('deleteMeal', () => {
    it('deletes meal', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });
      await Meal.deleteMeal(1);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM meals'), [1]);
    });
  });

  describe('updateMealDetails', () => {
    it('updates meal_time and returns row', async () => {
      const updated = { meal_id: 1, meal_time: '2025-05-01T10:00:00Z' };
      pool.query.mockResolvedValue({ rows: [updated] });
      const result = await Meal.updateMealDetails(1, '2025-05-01T10:00:00Z');
      expect(result).toEqual(updated);
    });
  });

  describe('clearMealItems', () => {
    it('deletes all food items for meal', async () => {
      pool.query.mockResolvedValue({ rowCount: 2 });
      await Meal.clearMealItems(1);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM meal_food_items'), [1]);
    });
  });
});
