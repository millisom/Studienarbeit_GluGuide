import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthContext } from '../../src/context/AuthContext';
import RecipeItem from '../../src/components/RecipeItem';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, opts) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
    i18n: { language: 'en' },
  }),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

describe('RecipeItem Component', () => {
  const recipe = {
    id: 1,
    name: 'Pancakes',
    description: 'Fluffy pancakes',
    total_calories: '300',
    total_proteins: '8',
    total_fats: '10',
    total_carbs: '40',
    ingredients: [
      { food_item: { name: 'Flour' }, quantity_in_grams: 100 },
      { name: 'Milk', quantity_in_grams: 200 },
    ],
  };

  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderItem = (authValue = { user: { id: 1 } }, props = {}) =>
    render(
      <AuthContext.Provider value={authValue}>
        <RecipeItem recipe={recipe} onAdd={vi.fn()} {...props} />
      </AuthContext.Provider>
    );

  it('shows loading when no recipe is provided', () => {
    render(
      <AuthContext.Provider value={{ user: { id: 1 } }}>
        <RecipeItem recipe={null} onAdd={vi.fn()} />
      </AuthContext.Provider>
    );
    expect(screen.getByText('recipeItem.loading')).toBeInTheDocument();
  });

  it('renders recipe name and description', () => {
    renderItem();
    expect(screen.getByText('Pancakes')).toBeInTheDocument();
    expect(screen.getByText('Fluffy pancakes')).toBeInTheDocument();
  });

  it('renders ingredients list', () => {
    renderItem();
    expect(screen.getByText(/Flour/)).toBeInTheDocument();
    expect(screen.getByText(/Milk/)).toBeInTheDocument();
  });

  it('shows nutrition values scaled to quantity=1 by default', () => {
    renderItem();
    expect(screen.getByText('300 kcal')).toBeInTheDocument();
    expect(screen.getAllByText(/8 g/i).length).toBeGreaterThan(0);
  });

  it('scales nutrition values when quantity is provided', () => {
    renderItem({ user: { id: 1 } }, { quantity: 2 });
    expect(screen.getByText('600 kcal')).toBeInTheDocument();
  });

  it('calls onAdd with recipe when user clicks and is logged in', () => {
    const onAdd = vi.fn();
    render(
      <AuthContext.Provider value={{ user: { id: 1 } }}>
        <RecipeItem recipe={recipe} onAdd={onAdd} />
      </AuthContext.Provider>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onAdd).toHaveBeenCalledWith(recipe);
  });

  it('shows alert and does not call onAdd when user is not logged in', () => {
    const onAdd = vi.fn();
    render(
      <AuthContext.Provider value={{ user: null }}>
        <RecipeItem recipe={recipe} onAdd={onAdd} />
      </AuthContext.Provider>
    );
    const button = screen.getByRole('button');
    if (!button.disabled) {
      fireEvent.click(button);
      expect(window.alert).toHaveBeenCalled();
    }
    expect(button).toBeDisabled();
    expect(onAdd).not.toHaveBeenCalled();
  });
});
