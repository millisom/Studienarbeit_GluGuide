import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import RecipeCard from '../../src/components/RecipeCard';
import { getRecipeById, deleteRecipe } from '../../src/api/recipeApi';

// 1. STABILE t-Funktion außerhalb definieren
const stableT = (key, opts) => (opts ? `${key}:${JSON.stringify(opts)}` : key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../src/api/recipeApi', () => ({
  getRecipeById: vi.fn(),
  deleteRecipe: vi.fn(),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('RecipeCard Component', () => {
  const baseRecipe = {
    id: 5,
    user_id: 1,
    name: 'Pasta',
    ingredients: [{ name: 'Tomato', quantity_in_grams: 100 }],
    instructions: ['Cook pasta', 'Add sauce'],
    total_calories: 500,
    total_proteins: 15,
    total_fats: 10,
    total_carbs: 60,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const renderCard = (authValue = { user: { id: 1 } }) =>
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <RecipeCard recipeId={5} />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('shows loading message initially', () => {
    getRecipeById.mockImplementation(() => new Promise(() => {}));
    renderCard();
    expect(screen.getByText('recipeCard.loading')).toBeInTheDocument();
  });

  it('renders recipe name, ingredients, instructions, and nutrition', async () => {
    getRecipeById.mockResolvedValue(baseRecipe);
    renderCard();

    // Warten bis Daten geladen sind
    expect(await screen.findByText('Pasta')).toBeInTheDocument();
    expect(screen.getByText(/Tomato/)).toBeInTheDocument();
    expect(screen.getByText('Cook pasta')).toBeInTheDocument();
    expect(screen.getByText(/500 kcal/)).toBeInTheDocument();
  });

  it('shows error when fetch returns 403', async () => {
    getRecipeById.mockRejectedValue({ response: { status: 403 } });
    renderCard();
    
    expect(await screen.findByText('recipeCard.errorForbidden')).toBeInTheDocument();
  });

  it('shows generic error on other fetch failures', async () => {
    getRecipeById.mockRejectedValue(new Error('boom'));
    renderCard();

    expect(await screen.findByText('recipeCard.errorLoad')).toBeInTheDocument();
  });

  it('shows edit and delete buttons for owner', async () => {
    getRecipeById.mockResolvedValue(baseRecipe);
    renderCard({ user: { id: 1 } });

    expect(await screen.findByText('recipeCard.btnEdit')).toBeInTheDocument();
    expect(screen.getByText('recipeCard.btnDelete')).toBeInTheDocument();
  });

  it('hides edit and delete buttons for non-owner', async () => {
    getRecipeById.mockResolvedValue(baseRecipe);
    renderCard({ user: { id: 99 } });

    // Warten bis Name erscheint, dann prüfen ob Buttons fehlen
    await screen.findByText('Pasta');
    expect(screen.queryByText('recipeCard.btnEdit')).not.toBeInTheDocument();
    expect(screen.queryByText('recipeCard.btnDelete')).not.toBeInTheDocument();
  });

  it('navigates to edit page on edit click', async () => {
    getRecipeById.mockResolvedValue(baseRecipe);
    renderCard({ user: { id: 1 } });

    const editBtn = await screen.findByText('recipeCard.btnEdit');
    fireEvent.click(editBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/recipes/5/edit');
  });

  it('deletes recipe on confirm and navigates after success', async () => {
    getRecipeById.mockResolvedValue(baseRecipe);
    deleteRecipe.mockResolvedValue({});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderCard({ user: { id: 1 } });

    const deleteBtn = await screen.findByText('recipeCard.btnDelete');
    fireEvent.click(deleteBtn);

    expect(deleteRecipe).toHaveBeenCalledWith(5);
    expect(await screen.findByText('recipeCard.deleteSuccess')).toBeInTheDocument();

    // Timer vorspulen für Navigation
    vi.advanceTimersByTime(1500);
    expect(mockNavigate).toHaveBeenCalledWith('/recipes');
  });

  it('does not delete if user cancels confirm', async () => {
    getRecipeById.mockResolvedValue(baseRecipe);
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderCard({ user: { id: 1 } });

    const deleteBtn = await screen.findByText('recipeCard.btnDelete');
    fireEvent.click(deleteBtn);
    
    expect(deleteRecipe).not.toHaveBeenCalled();
  });
});