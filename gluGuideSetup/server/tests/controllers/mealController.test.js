const mealController = require('../../controllers/mealController');
const Meal = require('../../models/mealModel');

jest.mock('../../models/mealModel', () => ({
  createMeal: jest.fn(),
  recalculateMealNutrition: jest.fn(),
  getMealById: jest.fn(),
  logFoodForMeal: jest.fn(),
  addFoodToMeal: jest.fn(),
  updateMealNutrition: jest.fn()
}));

describe('Meal Controller - Reminder Logic', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    

    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
    
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);

    req = {
      session: { userId: 69 },
      body: {
        meal_type: 'lunch',
        meal_time: futureDate.toISOString(),
        request_reminder: true, 
        items: [{ name: 'Apple', calories: 95 }]
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();

    const mockMealData = {
      meal_id: 100,
      total_calories: 95,
      total_carbs: 25,
      total_protein: 5,
      total_fat: 2
    };

    Meal.createMeal.mockResolvedValue(mockMealData);
    Meal.recalculateMealNutrition.mockResolvedValue(mockMealData);
    Meal.getMealById.mockResolvedValue(mockMealData);
    Meal.logFoodForMeal.mockResolvedValue(true);
    Meal.addFoodToMeal.mockResolvedValue(true);
    Meal.updateMealNutrition.mockResolvedValue(mockMealData);
  });

  afterEach(() => {

    jest.useRealTimers();
  });

  it('should create a meal and set a timeout alert if request_reminder is true', async () => {
    await mealController.createMeal(req, res, next);

    expect(Meal.createMeal).toHaveBeenCalled();
    

    expect(setTimeout).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('should not set a timeout alert if request_reminder is false', async () => {
    req.body.request_reminder = false;

    await mealController.createMeal(req, res, next);

    expect(Meal.createMeal).toHaveBeenCalled();
    

    expect(setTimeout).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});