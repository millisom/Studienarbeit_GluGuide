const mealController = require('../../controllers/mealController');
const Meal = require('../../models/mealModel');
const Alert = require('../../models/alertModel'); 


jest.mock('../../models/mealModel', () => ({
  createMeal: jest.fn(),
  recalculateMealNutrition: jest.fn(),
  getMealById: jest.fn(),
  logFoodForMeal: jest.fn(),
  addFoodToMeal: jest.fn(),
  updateMealNutrition: jest.fn()
}));

jest.mock('../../models/alertModel', () => ({
  createMealReminder: jest.fn() 
}));

describe('Meal Controller - Reminder Logic', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    
  
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);

    req = {
      session: { userId: 69 },
      body: {
        meal_type: 'lunch',
        meal_time: futureDate.toISOString(),
        request_reminder: true, 
        items: [{ food_id: 1, name: 'Apple', quantity_in_grams: 150 }]
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
      user_id: 69
    };

    // Mocks definieren
    Meal.createMeal.mockResolvedValue(mockMealData);
    Meal.addFoodToMeal.mockResolvedValue(true);
    Meal.updateMealNutrition.mockResolvedValue(mockMealData);
    Alert.createMealReminder.mockResolvedValue(true); 
  });

  it('should create a meal and call Alert model if request_reminder is true', async () => {
    await mealController.createMeal(req, res, next);

    expect(Meal.createMeal).toHaveBeenCalled();
    
   
    expect(Alert.createMealReminder).toHaveBeenCalledWith(
      69,       
      100,          
      'lunch',     
      expect.any(Date)
    );
    
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('should not create a reminder if request_reminder is false', async () => {
    req.body.request_reminder = false;

    await mealController.createMeal(req, res, next);

    expect(Meal.createMeal).toHaveBeenCalled();
    expect(Alert.createMealReminder).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});