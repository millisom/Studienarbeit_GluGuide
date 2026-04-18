import { describe, it, expect, vi } from 'vitest';
import { healthRoutes } from '../../../src/routes/routeModules/healthRoutes';


vi.mock('react', () => ({
  lazy: vi.fn(importFn => importFn)
}));


vi.mock('../../../src/pages/LogMealPage.jsx', () => ({ default: () => null }));
vi.mock('../../../src/pages/CreateRecipePage.jsx', () => ({ default: () => null }));
vi.mock('../../../src/pages/RecipeSummaryPage.jsx', () => ({ default: () => null }));
vi.mock('../../../src/components/RecipeCardRoute.jsx', () => ({ default: () => null }));
vi.mock('../../../src/pages/MealsOverviewPage.jsx', () => ({ default: () => null }));
vi.mock('../../../src/components/MealCardRoute.jsx', () => ({ default: () => null }));

describe('Health Routes Module', () => {
  it('should export the correct routes', () => {

    expect(Array.isArray(healthRoutes)).toBe(true);
    

    expect(healthRoutes.length).toBe(8);
    

    expect(healthRoutes).toContainEqual(
      expect.objectContaining({ path: '/logMeal' })
    );
    expect(healthRoutes).toContainEqual(
      expect.objectContaining({ path: '/createRecipe' })
    );
    expect(healthRoutes).toContainEqual(
      expect.objectContaining({ path: '/Recipes' })
    );
    expect(healthRoutes).toContainEqual(
      expect.objectContaining({ path: '/recipes/:id' })
    );

    expect(healthRoutes).toContainEqual(
      expect.objectContaining({ path: '/meals' })
    );
    expect(healthRoutes).toContainEqual(
      expect.objectContaining({ path: '/meal-history' })
    );
    expect(healthRoutes).toContainEqual(
      expect.objectContaining({ path: '/meals/:mealId' })
    );
  });
  
  it('should have the correct element properties', () => {
    healthRoutes.forEach(route => {
      expect(route).toHaveProperty('element');
      expect(typeof route.element).toBe('function');
    });
  });
});