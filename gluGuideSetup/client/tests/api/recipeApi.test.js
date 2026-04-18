import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getAllRecipes,
  getRecipeById,
  getRecipeByName,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  logRecipe,
  getRecipeLogs,
  deleteRecipeLog,
} from '../../src/api/recipeApi';

vi.mock('axios');

describe('recipeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAllRecipes fetches list', async () => {
    axios.get.mockResolvedValue({ data: [{ id: 1 }] });
    const result = await getAllRecipes();
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/recipes/recipes'),
      { withCredentials: true }
    );
    expect(result).toHaveLength(1);
  });

  it('getRecipeById fetches single recipe', async () => {
    axios.get.mockResolvedValue({ data: { id: 5 } });
    const result = await getRecipeById(5);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/recipes/5'),
      { withCredentials: true }
    );
    expect(result.id).toBe(5);
  });

  it('getRecipeByName url-encodes the name parameter', async () => {
    axios.get.mockResolvedValue({ data: [] });
    await getRecipeByName('Apple Pie');
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('name=Apple%20Pie'),
      { withCredentials: true }
    );
  });

  it('createRecipe posts new recipe', async () => {
    axios.post.mockResolvedValue({ data: { id: 9 } });
    const result = await createRecipe({ name: 'Soup' });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/recipes/recipes'),
      { name: 'Soup' },
      { withCredentials: true }
    );
    expect(result.id).toBe(9);
  });

  it('updateRecipe puts updates', async () => {
    axios.put.mockResolvedValue({ data: { ok: true } });
    const result = await updateRecipe(3, { name: 'Stew' });
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/recipes/3'),
      { name: 'Stew' },
      { withCredentials: true }
    );
    expect(result.ok).toBe(true);
  });

  it('deleteRecipe sends delete request', async () => {
    axios.delete.mockResolvedValue({ data: { deleted: true } });
    const result = await deleteRecipe(8);
    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/recipes/8'),
      { withCredentials: true }
    );
    expect(result.deleted).toBe(true);
  });

  it('logRecipe posts log data', async () => {
    axios.post.mockResolvedValue({ data: { logged: true } });
    const result = await logRecipe({ recipe_id: 1 });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/recipes/log'),
      { recipe_id: 1 },
      { withCredentials: true }
    );
    expect(result.logged).toBe(true);
  });

  it('getRecipeLogs fetches user logs', async () => {
    axios.get.mockResolvedValue({ data: [] });
    await getRecipeLogs(42);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/recipes/logs/42'),
      { withCredentials: true }
    );
  });

  it('deleteRecipeLog deletes log by id', async () => {
    axios.delete.mockResolvedValue({ data: { ok: true } });
    await deleteRecipeLog(11);
    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/logs/11'),
      { withCredentials: true }
    );
  });
});
