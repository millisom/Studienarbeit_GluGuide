const foodItemController = require('../../controllers/foodItemController');
const FoodItem = require('../../models/foodItemModel');
const Meal = require('../../models/mealModel');


jest.mock('../../models/foodItemModel');
jest.mock('../../models/mealModel');

describe('FoodItem Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {},
      body: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  describe('getAllFoodItems', () => {
    it('sollte 200 und alle Lebensmittel zurückgeben', async () => {
      const mockItems = [{ id: 1, name: 'Apfel' }, { id: 2, name: 'Brot' }];
      FoodItem.getAllFoodItems.mockResolvedValue(mockItems);

      await foodItemController.getAllFoodItems(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockItems);
    });
  });

  describe('getFoodItemById', () => {
    it('sollte 200 zurückgeben, wenn das Lebensmittel existiert', async () => {
      req.params.id = '1';
      const mockItem = { id: 1, name: 'Apfel' };
      FoodItem.getFoodItemById.mockResolvedValue(mockItem);

      await foodItemController.getFoodItemById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it('sollte 404 zurückgeben, wenn das Lebensmittel nicht gefunden wird', async () => {
      req.params.id = '999';
      FoodItem.getFoodItemById.mockResolvedValue(null);

      await foodItemController.getFoodItemById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Food item not found' });
    });
  });

  describe('createFoodItem', () => {
    it('sollte ein neues Lebensmittel erstellen (201)', async () => {
      req.body = { name: 'Banane', calories: 89, carbs: 23, proteins: 1, fats: 0.3 };
      FoodItem.createFoodItem.mockResolvedValue({ id: 3, ...req.body });

      await foodItemController.createFoodItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(FoodItem.createFoodItem).toHaveBeenCalledWith('Banane', 89, 23, 1, 0.3);
    });

    it('sollte 400 zurückgeben, wenn Felder fehlen', async () => {
      req.body = { name: 'Banane' }; // Kalorien etc. fehlen

      await foodItemController.createFoodItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });
  });

  describe('addFoodToMeal', () => {
    it('sollte ein Lebensmittel erfolgreich einer Mahlzeit hinzufügen', async () => {
      req.params.meal_id = '100';
      req.body = { food_id: 1, quantityInGrams: 150 };
      FoodItem.addFoodToMeal.mockResolvedValue({ id: 1, meal_id: 100 });

      await foodItemController.addFoodToMeal(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(FoodItem.addFoodToMeal).toHaveBeenCalledWith('100', 1, 150);
    });
  });

  describe('removeFoodItemFromMeal', () => {
    it('sollte Lebensmittel entfernen und Mahlzeit-Nährwerte aktualisieren', async () => {
      req.params = { meal_id: '100', id: '5' }; // 'id' ist die ID des Eintrags in der Verknüpfungstabelle
      FoodItem.removeFoodItemFromMeal.mockResolvedValue(true);
      Meal.updateMealNutrition.mockResolvedValue({});

      await foodItemController.removeFoodItemFromMeal(req, res, next);

      expect(FoodItem.removeFoodItemFromMeal).toHaveBeenCalledWith('5');
      expect(Meal.updateMealNutrition).toHaveBeenCalledWith('100');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('sollte 404 zurückgeben, wenn das Lebensmittel nicht in der Mahlzeit ist', async () => {
      req.params = { meal_id: '100', id: '5' };
      FoodItem.removeFoodItemFromMeal.mockResolvedValue(false);

      await foodItemController.removeFoodItemFromMeal(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(Meal.updateMealNutrition).not.toHaveBeenCalled();
    });
  });

  describe('updateFoodItemQuantity', () => {
    it('sollte die Menge aktualisieren und Nährwerte neu berechnen', async () => {
      req.params = { meal_id: '100', id: '5' };
      req.body = { quantityInGrams: 200 };
      const mockUpdated = { id: 5, quantity_in_grams: 200 };
      
      FoodItem.updateMealFoodItemQuantity.mockResolvedValue(mockUpdated);
      Meal.updateMealNutrition.mockResolvedValue({});

      await foodItemController.updateFoodItemQuantity(req, res, next);

      expect(FoodItem.updateMealFoodItemQuantity).toHaveBeenCalledWith('5', 200);
      expect(Meal.updateMealNutrition).toHaveBeenCalledWith('100');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdated);
    });
  });
});