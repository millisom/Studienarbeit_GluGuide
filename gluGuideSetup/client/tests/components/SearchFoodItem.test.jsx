import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthContext } from '../../src/context/AuthContext';
import { getFoodItemByName } from '../../src/api/foodItemApi';
import SearchFoodItem from '../../src/components/SearchFoodItem';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../src/api/foodItemApi', () => ({
  getFoodItemByName: vi.fn(),
}));

vi.mock('../../src/components/FoodItem', () => ({
  default: ({ food, onAdd }) => (
    <div data-testid="mock-food-item">
      <span>{food.name}</span>
      <button onClick={() => onAdd({ ...food, quantity_in_grams: 100 })}>add</button>
    </div>
  ),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

describe('SearchFoodItem Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const renderSearch = (authValue = { user: { id: 1 }, loading: false }, onAdd = vi.fn()) =>
    render(
      <AuthContext.Provider value={authValue}>
        <SearchFoodItem onAdd={onAdd} />
      </AuthContext.Provider>
    );

  it('disables input when user is not logged in', () => {
    renderSearch({ user: null, loading: false });
    const input = screen.getByPlaceholderText('searchFoodItem.loginPlaceholder');
    expect(input).toBeDisabled();
  });

  it('shows suggestions after typing > 2 chars (debounced)', async () => {
    getFoodItemByName.mockResolvedValue([
      { food_id: 1, name: 'Apple' },
      { food_id: 2, name: 'Apricot' },
    ]);
    renderSearch();

    fireEvent.change(screen.getByPlaceholderText('searchFoodItem.placeholder'), {
      target: { value: 'ap' },
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Apricot')).toBeInTheDocument();
    });
  });

  it('does not query when input length < 2', () => {
    renderSearch();
    fireEvent.change(screen.getByPlaceholderText('searchFoodItem.placeholder'), {
      target: { value: 'a' },
    });
    expect(getFoodItemByName).not.toHaveBeenCalled();
  });

  it('shows error message when API fails', async () => {
    getFoodItemByName.mockRejectedValue(new Error('boom'));
    renderSearch();

    fireEvent.change(screen.getByPlaceholderText('searchFoodItem.placeholder'), {
      target: { value: 'app' },
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('searchFoodItem.errorLoad')).toBeInTheDocument();
    });
  });

  it('shows no-results message when list is empty', async () => {
    getFoodItemByName.mockResolvedValue([]);
    renderSearch();

    fireEvent.change(screen.getByPlaceholderText('searchFoodItem.placeholder'), {
      target: { value: 'zzz' },
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('searchFoodItem.noResults')).toBeInTheDocument();
    });
  });

  it('opens modal when suggestion is clicked', async () => {
    getFoodItemByName.mockResolvedValue([{ food_id: 1, name: 'Apple' }]);
    renderSearch();

    fireEvent.change(screen.getByPlaceholderText('searchFoodItem.placeholder'), {
      target: { value: 'ap' },
    });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => screen.getByText('Apple'));
    fireEvent.click(screen.getByText('Apple'));

    expect(screen.getByTestId('mock-food-item')).toBeInTheDocument();
  });

  it('calls onAdd and closes modal after adding from FoodItem', async () => {
    getFoodItemByName.mockResolvedValue([{ food_id: 1, name: 'Apple' }]);
    const onAdd = vi.fn();
    renderSearch({ user: { id: 1 }, loading: false }, onAdd);

    fireEvent.change(screen.getByPlaceholderText('searchFoodItem.placeholder'), {
      target: { value: 'ap' },
    });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => screen.getByText('Apple'));
    fireEvent.click(screen.getByText('Apple'));
    fireEvent.click(screen.getByText('add'));

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ name: 'Apple', quantity_in_grams: 100 }));
  });
});
