const calculateTotalNutrition = require('../../helpers/nutritionHelper');
const FoodItem = require('../../models/foodItemModel');

jest.mock('../../models/foodItemModel');

describe('nutritionHelper – calculateTotalNutrition', () => {
  beforeEach(() => jest.clearAllMocks());

  const mockFood = (id, calories, proteins, fats, carbs) => ({
    food_id: id, name: 'TestFood', calories, proteins, fats, carbs,
  });

  it('calculates nutrition for a single ingredient correctly', async () => {
    FoodItem.getFoodItemById.mockResolvedValue(mockFood(1, 200, 10, 5, 30));
    const result = await calculateTotalNutrition([
      { food_id: 1, quantity_in_grams: 100 },
    ]);
    expect(result.totalCalories).toBeCloseTo(200);
    expect(result.totalProteins).toBeCloseTo(10);
    expect(result.totalFats).toBeCloseTo(5);
    expect(result.totalCarbs).toBeCloseTo(30);
  });

  it('scales nutrition proportionally to quantity', async () => {
    FoodItem.getFoodItemById.mockResolvedValue(mockFood(1, 200, 10, 5, 30));
    const result = await calculateTotalNutrition([
      { food_id: 1, quantity_in_grams: 50 },
    ]);
    expect(result.totalCalories).toBeCloseTo(100); // 200/100 * 50
    expect(result.totalCarbs).toBeCloseTo(15);
  });

  it('sums nutrition across multiple ingredients', async () => {
    FoodItem.getFoodItemById
      .mockResolvedValueOnce(mockFood(1, 200, 10, 4, 30))
      .mockResolvedValueOnce(mockFood(2, 100, 5,  2, 15));

    const result = await calculateTotalNutrition([
      { food_id: 1, quantity_in_grams: 100 },
      { food_id: 2, quantity_in_grams: 100 },
    ]);
    expect(result.totalCalories).toBeCloseTo(300);
    expect(result.totalProteins).toBeCloseTo(15);
  });

  it('falls back to quantityInGrams when quantity_in_grams is missing', async () => {
    FoodItem.getFoodItemById.mockResolvedValue(mockFood(1, 200, 10, 5, 30));
    const result = await calculateTotalNutrition([
      { food_id: 1, quantityInGrams: 50 },
    ]);
    expect(result.totalCalories).toBeCloseTo(100);
  });

  it('defaults to 100g when no quantity field is provided', async () => {
    FoodItem.getFoodItemById.mockResolvedValue(mockFood(1, 200, 10, 5, 30));
    const result = await calculateTotalNutrition([{ food_id: 1 }]);
    expect(result.totalCalories).toBeCloseTo(200);
  });

  it('throws when a food item is not found', async () => {
    FoodItem.getFoodItemById.mockResolvedValue(null);
    await expect(
      calculateTotalNutrition([{ food_id: 999, quantity_in_grams: 100 }])
    ).rejects.toThrow('Food item with ID 999 not found');
  });

  it('returns zeros for an empty ingredient list', async () => {
    const result = await calculateTotalNutrition([]);
    expect(result).toEqual({ totalCalories: 0, totalProteins: 0, totalFats: 0, totalCarbs: 0 });
  });
});
