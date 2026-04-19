const FoodItem = require('../../models/foodItemModel');
const pool = require('../../config/db');

jest.mock('../../config/db', () => ({ query: jest.fn() }));

describe('FoodItemModel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getAllFoodItems returns all rows', async () => {
    pool.query.mockResolvedValue({ rows: [{ food_id: 1 }, { food_id: 2 }] });
    const result = await FoodItem.getAllFoodItems();
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM foods', []);
    expect(result).toHaveLength(2);
  });

  it('getFoodItemByName returns matching items', async () => {
    pool.query.mockResolvedValue({ rows: [{ food_id: 3, name: 'Apple' }] });
    const result = await FoodItem.getFoodItemByName('apple');
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('ILIKE'), ['%apple%']);
    expect(result[0].name).toBe('Apple');
  });

  it('getFoodItemById returns single item', async () => {
    pool.query.mockResolvedValue({ rows: [{ food_id: 4, name: 'Banana' }] });
    const result = await FoodItem.getFoodItemById(4);
    expect(result).toEqual({ food_id: 4, name: 'Banana' });
  });

  it('createFoodItem inserts and returns new item', async () => {
    const row = { food_id: 10, name: 'Rice', calories: 130, carbs: 28, proteins: 3, fats: 0.3 };
    pool.query.mockResolvedValue({ rows: [row] });
    const result = await FoodItem.createFoodItem('Rice', 130, 28, 3, 0.3);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO foods'), ['Rice', 130, 28, 3, 0.3]);
    expect(result).toEqual(row);
  });

  it('updateFoodItem updates and returns item', async () => {
    const row = { food_id: 5, name: 'UpdatedName' };
    pool.query.mockResolvedValue({ rows: [row] });
    const result = await FoodItem.updateFoodItem(5, 'UpdatedName', 100, 20, 5, 2);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE foods'), expect.any(Array));
    expect(result).toEqual(row);
  });

  it('deleteFoodItem deletes and returns deleted item', async () => {
    pool.query.mockResolvedValue({ rows: [{ food_id: 5 }] });
    const result = await FoodItem.deleteFoodItem(5);
    expect(result).toEqual({ food_id: 5 });
  });

  it('addFoodToMeal inserts food into meal', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    const result = await FoodItem.addFoodToMeal(1, 10, 150);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO meal_food_items'), [1, 10, 150]);
    expect(result).toEqual({ id: 1 });
  });

  it('removeFoodItemFromMeal deletes and returns deleted', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    const result = await FoodItem.removeFoodItemFromMeal(1);
    expect(result).toEqual({ id: 1 });
  });

  it('updateMealFoodItemQuantity updates quantity and returns row', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, quantity_in_grams: 200 }] });
    const result = await FoodItem.updateMealFoodItemQuantity(1, 200);
    expect(result).toEqual({ id: 1, quantity_in_grams: 200 });
  });

  it('throws on DB error', async () => {
    pool.query.mockRejectedValue(new Error('DB down'));
    await expect(FoodItem.getAllFoodItems()).rejects.toThrow('DB down');
  });
});
