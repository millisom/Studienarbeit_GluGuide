const mealController = require('../../controllers/mealController');
const Meal = require('../../models/mealModel');
const Recipe = require('../../models/recipeModel');
const Alert = require('../../models/alertModel');

jest.mock('../../models/mealModel', () => ({
  createMeal: jest.fn(),
  addFoodToMeal: jest.fn(),
  updateMealNutrition: jest.fn(),
  getMealById: jest.fn(),
  getMealFoodItems: jest.fn(),
  getMealsByUser: jest.fn(),
  updateMealDetails: jest.fn(),
  clearMealItems: jest.fn(),
  deleteMeal: jest.fn(),
}));

jest.mock('../../models/recipeModel', () => ({
  getRecipeById: jest.fn(),
}));

jest.mock('../../models/alertModel', () => ({
  createMealReminder: jest.fn(),
}));

describe('Meal Controller', () => {
  let req, res, next;

  const mockMeal = { meal_id: 100, user_id: 69, total_calories: 95 };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});


    const futureTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    req = {
      session: { userId: 69 },
      body: {
        meal_type: 'lunch',
        meal_time: futureTime,
        notes: '',
        items: [{ food_id: 1, name: 'Apple', quantity_in_grams: 150 }],
        request_reminder: false,
      },
      params: {},
    };

    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
    next = jest.fn();

    Meal.createMeal.mockResolvedValue(mockMeal);
    Meal.addFoodToMeal.mockResolvedValue(true);
    Meal.updateMealNutrition.mockResolvedValue(mockMeal);
    Alert.createMealReminder.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });


  describe('createMeal', () => {
    it('creates meal, adds food items, returns 201', async () => {
      await mealController.createMeal(req, res, next);

      expect(Meal.createMeal).toHaveBeenCalledWith(
        69, 'lunch', req.body.meal_time, '',
        null, req.body.items, null
      );
      expect(Meal.addFoodToMeal).toHaveBeenCalledWith(100, 1, 150);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockMeal);
    });

    it('returns 400 when meal_type is missing', async () => {
      req.body.meal_type = '';
      await mealController.createMeal(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when userId is missing from session', async () => {
      req.session.userId = null;
      await mealController.createMeal(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('creates Alert reminder when request_reminder is true and meal is in the future', async () => {
      req.body.request_reminder = true;
      await mealController.createMeal(req, res, next);

      expect(Alert.createMealReminder).toHaveBeenCalledWith(
        69, 100, 'lunch', expect.any(Date)
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('does NOT create reminder when request_reminder is false', async () => {
      req.body.request_reminder = false;
      await mealController.createMeal(req, res, next);
      expect(Alert.createMealReminder).not.toHaveBeenCalled();
    });

    it('does NOT create reminder when meal_time is in the past', async () => {
      req.body.request_reminder = true;
      req.body.meal_time = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      await mealController.createMeal(req, res, next);
      expect(Alert.createMealReminder).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('resolves recipe and scales ingredients when recipe_id provided', async () => {
      req.body.recipe_id = 5;
      req.body.items = [];
      Recipe.getRecipeById.mockResolvedValue({
        id: 5,
        ingredients: [{ food_id: 2, name: 'Tomato', quantity_in_grams: 100 }],
      });

      await mealController.createMeal(req, res, next);

      expect(Recipe.getRecipeById).toHaveBeenCalledWith(5);
      expect(Meal.addFoodToMeal).toHaveBeenCalledWith(100, 2, 100);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('returns 404 when recipe_id is given but recipe not found', async () => {
      req.body.recipe_id = 99;
      Recipe.getRecipeById.mockResolvedValue(null);

      await mealController.createMeal(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('calls next() on unexpected errors', async () => {
      Meal.createMeal.mockRejectedValue(new Error('DB crash'));
      await mealController.createMeal(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getMealById', () => {
    it('returns meal with food items (200)', async () => {
      req.params.id = '100';
      Meal.getMealById.mockResolvedValue(mockMeal);
      Meal.getMealFoodItems.mockResolvedValue([{ food_id: 1 }]);

      await mealController.getMealById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ...mockMeal, items: [{ food_id: 1 }] });
    });

    it('returns 404 when meal not found', async () => {
      req.params.id = '999';
      Meal.getMealById.mockResolvedValue(null);

      await mealController.getMealById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });


  describe('getMealsByUser', () => {
    it('returns meals for session user (200)', async () => {
      Meal.getMealsByUser.mockResolvedValue([mockMeal]);
      await mealController.getMealsByUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockMeal]);
    });

    it('returns 400 when no userId in session', async () => {
      req.session.userId = null;
      await mealController.getMealsByUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });


  describe('updateMealNutrition', () => {
    it('recalculates and returns updated meal (200)', async () => {
      req.params.id = '100';
      Meal.updateMealNutrition.mockResolvedValue(mockMeal);
      await mealController.updateMealNutrition(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

 
  describe('updateMeal', () => {
    beforeEach(() => {
      req.params.id = '100';
      req.body = { meal_time: new Date().toISOString(), items: [] };
      Meal.getMealById.mockResolvedValue(mockMeal);
      Meal.updateMealDetails.mockResolvedValue(mockMeal);
      Meal.updateMealNutrition.mockResolvedValue(mockMeal);
    });

    it('updates meal and returns 200', async () => {
      await mealController.updateMeal(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 401 when no userId in session', async () => {
      req.session.userId = null;
      await mealController.updateMeal(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns 404 when meal not found', async () => {
      Meal.getMealById.mockResolvedValue(null);
      await mealController.updateMeal(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 403 when meal belongs to different user', async () => {
      Meal.getMealById.mockResolvedValue({ ...mockMeal, user_id: 999 });
      await mealController.updateMeal(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });


  describe('deleteMeal', () => {
    it('deletes meal and returns 204', async () => {
      req.params.id = '100';
      Meal.deleteMeal.mockResolvedValue(true);
      await mealController.deleteMeal(req, res, next);
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });
});
