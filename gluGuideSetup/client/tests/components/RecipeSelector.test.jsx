import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthContext } from '../../src/context/AuthContext';
import { getRecipeByName, getRecipeById } from '../../src/api/recipeApi';
import RecipeSelector from '../../src/components/RecipeSelector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../src/api/recipeApi', () => ({
  getRecipeByName: vi.fn(),
  getRecipeById: vi.fn(),
}));

vi.mock('../../src/components/RecipeItem', () => ({
  default: ({ recipe, onAdd, quantity }) => (
    <div data-testid="mock-recipe-item">
      <span>{recipe?.name}</span>
      <span data-testid="quantity">{quantity}</span>
      <button onClick={() => onAdd(recipe)}>add-recipe</button>
    </div>
  ),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

describe('RecipeSelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const renderSelector = (authValue = { user: { id: 1 }, loading: false }, onSelect = vi.fn()) =>
    render(
      <AuthContext.Provider value={authValue}>
        <RecipeSelector onSelect={onSelect} />
      </AuthContext.Provider>
    );

  it('disables input when user is not logged in', () => {
    renderSelector({ user: null, loading: false });
    const input = screen.getByPlaceholderText('recipeSelector.loginPlaceholder');
    expect(input).toBeDisabled();
  });

  it('does not query for input shorter than 2 chars', () => {
    renderSelector();
    fireEvent.change(screen.getByPlaceholderText('recipeSelector.searchPlaceholder'), {
      target: { value: 'a' },
    });
    expect(getRecipeByName).not.toHaveBeenCalled();
  });

  it('shows recipe suggestions after debounced search', async () => {
    getRecipeByName.mockResolvedValue([
      { id: 1, name: 'Pasta' },
      { id: 2, name: 'Pancake' },
    ]);
    renderSelector();

    fireEvent.change(screen.getByPlaceholderText('recipeSelector.searchPlaceholder'), {
      target: { value: 'pa' },
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('Pasta')).toBeInTheDocument();
      expect(screen.getByText('Pancake')).toBeInTheDocument();
    });
  });

  it('loads full recipe details when a suggestion is selected', async () => {
    getRecipeByName.mockResolvedValue([{ id: 1, name: 'Pasta' }]);
    getRecipeById.mockResolvedValue({ id: 1, name: 'Pasta', description: 'Yum' });
    renderSelector();

    fireEvent.change(screen.getByPlaceholderText('recipeSelector.searchPlaceholder'), {
      target: { value: 'pa' },
    });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => screen.getByText('Pasta'));

    await act(async () => {
      fireEvent.click(screen.getByText('Pasta'));
    });

    await waitFor(() => {
      expect(getRecipeById).toHaveBeenCalledWith(1);
      expect(screen.getByTestId('mock-recipe-item')).toBeInTheDocument();
    });
  });

  it('shows error when loading recipe details fails', async () => {
    getRecipeByName.mockResolvedValue([{ id: 1, name: 'Pasta' }]);
    getRecipeById.mockRejectedValue(new Error('boom'));
    renderSelector();

    fireEvent.change(screen.getByPlaceholderText('recipeSelector.searchPlaceholder'), {
      target: { value: 'pa' },
    });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    await waitFor(() => screen.getByText('Pasta'));

    await act(async () => {
      fireEvent.click(screen.getByText('Pasta'));
    });

    await waitFor(() => {
      expect(screen.getByText('recipeSelector.errorLoadDetails')).toBeInTheDocument();
    });
  });
});
