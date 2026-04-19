const recipeController = require('../../controllers/recipeController');
const Recipe = require('../../models/recipeModel');
const calculateTotalNutrition = require('../../helpers/nutritionHelper');


jest.mock('../../models/recipeModel');
jest.mock('../../helpers/nutritionHelper');

describe('Recipe Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      session: { userId: 1 },
      params: {},
      query: {},
      body: {},
      recipe: null
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  describe('getAllRecipes', () => {
    it('sollte alle Rezepte des Users zurückgeben (200)', async () => {
      const mockRecipes = [{ id: 1, name: 'Pasta' }];
      Recipe.getAllRecipesByUser.mockResolvedValue(mockRecipes);

      await recipeController.getAllRecipes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecipes);
    });

    it('sollte 401 zurückgeben, wenn keine userId in der Session ist', async () => {
      req.session.userId = null;

      await recipeController.getAllRecipes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
    });
  });

  describe('getRecipeById', () => {
    it('sollte das Rezept aus req.recipe zurückgeben (200)', async () => {
      req.recipe = { id: 1, name: 'Pasta' };

      await recipeController.getRecipeById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(req.recipe);
    });
  });

  describe('createRecipe', () => {
    it('sollte ein neues Rezept erstellen (201)', async () => {
      req.body = { 
        name: 'Omelett', 
        ingredients: [{ food_id: 10, quantity_in_grams: 100 }], 
        instructions: ['Eier schlagen'] 
      };
      const mockNewRecipe = { id: 99, ...req.body };
      Recipe.createRecipe.mockResolvedValue(mockNewRecipe);

      await recipeController.createRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockNewRecipe);
    });

    it('sollte 400 zurückgeben, wenn Pflichtfelder fehlen', async () => {
      req.body = { name: '' }; // Ungültig

      await recipeController.createRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'name, ingredients, and instructions are required'
      });
    });

    it('sollte 404 zurückgeben, wenn ein Food Item nicht existiert (Model Error)', async () => {
      req.body = { name: 'X', ingredients: [], instructions: [] };
      Recipe.createRecipe.mockRejectedValue(new Error('Food item not found'));

      await recipeController.createRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Food item not found' });
    });
  });

  describe('updateRecipe', () => {
    it('sollte ein Rezept erfolgreich aktualisieren (200)', async () => {
      req.params.id = '123';
      req.body = { name: 'Updated Pasta' };
      Recipe.updateRecipe.mockResolvedValue({ id: 123, name: 'Updated Pasta' });

      await recipeController.updateRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(Recipe.updateRecipe).toHaveBeenCalled();
    });

    it('sollte 404 zurückgeben, wenn das Rezept nicht gefunden wurde', async () => {
      Recipe.updateRecipe.mockResolvedValue(null);
      await recipeController.updateRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteRecipe', () => {
    it('sollte 200 zurückgeben, wenn das Rezept gelöscht wurde', async () => {
      req.params.id = '123';
      Recipe.deleteRecipe.mockResolvedValue(true);

      await recipeController.deleteRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Recipe deleted successfully' });
    });
  });

  describe('logRecipe', () => {
    it('sollte eine Mahlzeit basierend auf einem Rezept loggen (201)', async () => {
      req.body = { recipe_id: 5, action: 'eat' };
      const mockIngredients = [{ food_id: 1, quantity_in_grams: 50 }];
      const mockNutrition = { calories: 200 };
      
      Recipe.getRecipeIngredients.mockResolvedValue(mockIngredients);
      calculateTotalNutrition.mockResolvedValue(mockNutrition);
      Recipe.logRecipe.mockResolvedValue({ log_id: 1 });

      await recipeController.logRecipe(req, res, next);

      expect(calculateTotalNutrition).toHaveBeenCalledWith(mockIngredients);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('sollte 404 zurückgeben, wenn das Rezept keine Zutaten hat', async () => {
      req.body = { recipe_id: 5, action: 'eat' };
      Recipe.getRecipeIngredients.mockResolvedValue([]);

      await recipeController.logRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Recipe ingredients not found' });
    });
  });

  describe('deleteRecipeLog', () => {
    it('sollte einen Log-Eintrag löschen (200)', async () => {
      req.params.id = '10';
      Recipe.deleteRecipeLog.mockResolvedValue({ id: 10 });

      await recipeController.deleteRecipeLog(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Log deleted successfully' })
        );
    });

    it('sollte 400 zurückgeben, wenn die ID ungültig ist', async () => {
      req.params.id = 'abc'; 
      
      await recipeController.deleteRecipeLog(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});