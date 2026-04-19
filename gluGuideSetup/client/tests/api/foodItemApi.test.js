import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import {
  getAllFoodItems,
  getFoodItemById,
  getFoodItemByName,
  addFoodToMeal,
  removeFoodFromMeal,
  updateFoodItemQuantity,
} from '../../src/api/foodItemApi';

vi.mock('axios');

describe('foodItemApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getAllFoodItems fetches all items', async () => {
    axios.get.mockResolvedValue({ data: [{ id: 1, name: 'Apple' }] });
    const result = await getAllFoodItems();
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/food/getAllFoodItems'),
      { withCredentials: true }
    );
    expect(result).toHaveLength(1);
  });

  it('getAllFoodItems throws and logs on error', async () => {
    axios.get.mockRejectedValue({ response: { data: 'Server error' } });
    await expect(getAllFoodItems()).rejects.toBeTruthy();
    expect(console.error).toHaveBeenCalled();
  });

  it('getFoodItemById fetches single item', async () => {
    axios.get.mockResolvedValue({ data: { id: 4 } });
    const result = await getFoodItemById(4);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/food/getFoodItemsby/4'),
      { withCredentials: true }
    );
    expect(result.id).toBe(4);
  });

  it('getFoodItemByName searches by name', async () => {
    axios.get.mockResolvedValue({ data: [{ name: 'Banana' }] });
    await getFoodItemByName('Banana');
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/food/getFoodItemBy/Banana'),
      { withCredentials: true }
    );
  });

  it('addFoodToMeal posts food and quantity', async () => {
    axios.post.mockResolvedValue({ data: { added: true } });
    const result = await addFoodToMeal(10, 2, 150);

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/food/add-to-meal/10'),
      { food_id: 2, quantityInGrams: 150 },
      { withCredentials: true }
    );
    expect(result.added).toBe(true);
  });

  it('addFoodToMeal throws on error and logs', async () => {
    axios.post.mockRejectedValue({ message: 'boom' });
    await expect(addFoodToMeal(1, 2, 100)).rejects.toBeTruthy();
    expect(console.error).toHaveBeenCalled();
  });

  it('removeFoodFromMeal deletes food item', async () => {
    axios.delete.mockResolvedValue({ data: { removed: true } });
    const result = await removeFoodFromMeal(5, 99);

    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/food/remove-from-meal/5/food-items/99'),
      { withCredentials: true }
    );
    expect(result.removed).toBe(true);
  });

  it('updateFoodItemQuantity updates quantity', async () => {
    axios.put.mockResolvedValue({ data: { updated: true } });
    const result = await updateFoodItemQuantity(3, 7, 200);

    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/food/update-meal-item/3/food-items/7'),
      { quantityInGrams: 200 },
      { withCredentials: true }
    );
    expect(result.updated).toBe(true);
  });
});
