const calculateSingleFoodItemNutrition = require('../../helpers/singleFoodItemNutritionHelper');

describe('singleFoodItemNutritionHelper – calculateSingleFoodItemNutrition', () => {
  const food = { calories: 200, proteins: 10, fats: 5, carbs: 30 };

  it('calculates correct nutrition for 100g (default)', () => {
    const result = calculateSingleFoodItemNutrition(food);
    expect(result.totalCalories).toBeCloseTo(200);
    expect(result.totalProteins).toBeCloseTo(10);
    expect(result.totalFats).toBeCloseTo(5);
    expect(result.totalCarbs).toBeCloseTo(30);
  });

  it('scales nutrition proportionally for 50g', () => {
    const result = calculateSingleFoodItemNutrition(food, 50);
    expect(result.totalCalories).toBeCloseTo(100);
    expect(result.totalProteins).toBeCloseTo(5);
    expect(result.totalFats).toBeCloseTo(2.5);
    expect(result.totalCarbs).toBeCloseTo(15);
  });

  it('returns zeros for 0g quantity', () => {
    const result = calculateSingleFoodItemNutrition(food, 0);
    expect(result.totalCalories).toBe(0);
    expect(result.totalCarbs).toBe(0);
  });

  it('scales correctly for 200g (double portion)', () => {
    const result = calculateSingleFoodItemNutrition(food, 200);
    expect(result.totalCalories).toBeCloseTo(400);
    expect(result.totalProteins).toBeCloseTo(20);
  });

  it('returns all four nutritional fields', () => {
    const result = calculateSingleFoodItemNutrition(food, 100);
    expect(result).toHaveProperty('totalCalories');
    expect(result).toHaveProperty('totalProteins');
    expect(result).toHaveProperty('totalFats');
    expect(result).toHaveProperty('totalCarbs');
  });
});
