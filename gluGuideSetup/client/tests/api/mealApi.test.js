import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  createMeal,
  getMealById,
  getAllMealsForUser,
  recalculateMealNutrition,
  deleteMeal,
  updateMeal,
} from '../../src/api/mealApi';

vi.mock('axios');

describe('mealApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createMeal posts meal data and returns response', async () => {
    axios.post.mockResolvedValue({ data: { meal_id: 1 } });
    const result = await createMeal({ meal_type: 'lunch' });

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/meal/createMeal'),
      { meal_type: 'lunch' },
      { withCredentials: true }
    );
    expect(result).toEqual({ meal_id: 1 });
  });

  it('getMealById fetches meal by id', async () => {
    axios.get.mockResolvedValue({ data: { id: 7, name: 'Breakfast' } });
    const result = await getMealById(7);

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/meal/getMealBy/7'),
      { withCredentials: true }
    );
    expect(result.id).toBe(7);
  });

  it('getAllMealsForUser posts to correct endpoint', async () => {
    axios.post.mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });
    const result = await getAllMealsForUser(42);

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/meal/getAllMealsFor/user'),
      {},
      { withCredentials: true }
    );
    expect(result).toHaveLength(2);
  });

  it('recalculateMealNutrition puts to recalculate endpoint', async () => {
    axios.put.mockResolvedValue({ data: { success: true } });
    const result = await recalculateMealNutrition(5);

    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/meal/5/recalculate'),
      null,
      { withCredentials: true }
    );
    expect(result.success).toBe(true);
  });

  it('deleteMeal calls delete endpoint', async () => {
    axios.delete.mockResolvedValue({ data: { deleted: true } });
    const result = await deleteMeal(3);

    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/meal/deleteMeal/3'),
      { withCredentials: true }
    );
    expect(result.deleted).toBe(true);
  });

  it('updateMeal sends payload to update endpoint', async () => {
    axios.put.mockResolvedValue({ data: { updated: true } });
    const result = await updateMeal(9, { notes: 'test' });

    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/meal/updateMeal/9'),
      { notes: 'test' },
      { withCredentials: true }
    );
    expect(result.updated).toBe(true);
  });

  it('propagates errors from axios', async () => {
    axios.post.mockRejectedValue(new Error('Network error'));
    await expect(createMeal({})).rejects.toThrow('Network error');
  });
});
