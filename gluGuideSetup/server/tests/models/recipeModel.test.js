const Recipe = require('../../models/recipeModel');
const pool   = require('../../config/db');

jest.mock('../../config/db', () => ({ query: jest.fn() }));
jest.mock('../../helpers/nutritionHelper', () =>
  jest.fn().mockResolvedValue({ totalCalories: 300, totalProteins: 12, totalFats: 8, totalCarbs: 45 })
);

describe('RecipeModel', () => {
  beforeEach(() => jest.clearAllMocks());


  describe('getAllRecipesByUser', () => {
    it('returns recipes for user', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }] });
      const result = await Recipe.getAllRecipesByUser(1);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE user_id = $1'), [1]);
      expect(result).toHaveLength(2);
    });

    it('throws on DB error', async () => {
      pool.query.mockRejectedValue(new Error('DB'));
      await expect(Recipe.getAllRecipesByUser(1)).rejects.toThrow();
    });
  });


  describe('getRecipeById', () => {
    it('returns null when not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const result = await Recipe.getRecipeById(999);
      expect(result).toBeNull();
    });

    it('returns recipe with enriched ingredients (food_name lookup)', async () => {
      const recipeRow = { id: 1, name: 'Pasta', ingredients: [{ food_id: 10, quantity_in_grams: 100 }] };
      pool.query
        .mockResolvedValueOnce({ rows: [recipeRow] })         
        .mockResolvedValueOnce({ rows: [{ name: 'Flour' }] });

      const result = await Recipe.getRecipeById(1);
      expect(result.ingredients[0].food_name).toBe('Flour');
    });

    it('handles recipe without ingredients array', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1, name: 'Plain', ingredients: null }] });
      const result = await Recipe.getRecipeById(1);
      expect(result.name).toBe('Plain');
    });
  });

 
  describe('getRecipeByName', () => {
    it('returns matching recipes', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1, name: 'Pasta Bolognese' }] });
      const result = await Recipe.getRecipeByName(1, 'pasta');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        [1, '%pasta%']
      );
      expect(result).toHaveLength(1);
    });
  });


  describe('createRecipe', () => {
    it('inserts recipe with nutrition and returns row', async () => {
      const row = { id: 5, name: 'Salad', total_calories: 300 };
      pool.query.mockResolvedValue({ rows: [row] });

      const result = await Recipe.createRecipe(
        1, 'Salad',
        [{ food_id: 1, quantity_in_grams: 100 }],
        ['Mix ingredients'],
        new Date()
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO recipes'),
        expect.arrayContaining([1, 'Salad', 300])
      );
      expect(result).toEqual(row);
    });
  });


  describe('updateRecipe', () => {
    it('updates recipe and returns updated row', async () => {
      const updated = { id: 1, name: 'Updated Pasta' };
      pool.query.mockResolvedValue({ rows: [updated] });

      const result = await Recipe.updateRecipe(
        1, 1, 'Updated Pasta',
        [{ food_id: 1, quantity_in_grams: 100 }],
        ['Step 1'],
        new Date()
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE recipes'),
        expect.any(Array)
      );
      expect(result).toEqual(updated);
    });

    it('returns null when recipe not found or not owner', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const result = await Recipe.updateRecipe(999, 1, 'X', [], [], new Date());
      expect(result).toBeNull();
    });
  });


  describe('deleteRecipe', () => {
    it('deletes recipe and returns deleted row', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await Recipe.deleteRecipe(1, 1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM recipes'),
        [1, 1]
      );
      expect(result).toEqual({ id: 1 });
    });

    it('returns null when recipe not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      expect(await Recipe.deleteRecipe(999, 1)).toBeNull();
    });
  });


  describe('getRecipeIngredients', () => {
    it('returns ingredients array', async () => {
      const ings = [{ food_id: 1, quantity_in_grams: 100 }];
      pool.query.mockResolvedValue({ rows: [{ ingredients: ings }] });
      const result = await Recipe.getRecipeIngredients(1);
      expect(result).toEqual(ings);
    });

    it('returns null when recipe not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      expect(await Recipe.getRecipeIngredients(999)).toBeNull();
    });
  });


  describe('logRecipe', () => {
    it('inserts log and returns row', async () => {
      const row = { id: 1, recipe_id: 5 };
      pool.query.mockResolvedValue({ rows: [row] });
      const nutrition = { totalCalories: 300, totalProteins: 12, totalFats: 8, totalCarbs: 45 };
      const result = await Recipe.logRecipe(1, 5, 'eat', new Date(), nutrition);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO recipe_logs'),
        expect.any(Array)
      );
      expect(result).toEqual(row);
    });
  });


  describe('getRecipeLogs', () => {
    it('returns logs for user', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
      const result = await Recipe.getRecipeLogs(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1'),
        [1]
      );
      expect(result).toHaveLength(1);
    });
  });


  describe('deleteRecipeLog', () => {
    it('deletes log and returns row', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 10 }] });
      const result = await Recipe.deleteRecipeLog(10);
      expect(result).toEqual({ id: 10 });
    });

    it('returns undefined when not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      expect(await Recipe.deleteRecipeLog(999)).toBeUndefined();
    });
  });
});
