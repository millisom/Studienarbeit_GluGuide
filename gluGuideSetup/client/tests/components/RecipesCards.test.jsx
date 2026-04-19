import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import { getAllRecipes } from '../../src/api/recipeApi';
import RecipesCards from '../../src/components/RecipesCards';

// 1. Stabile t-Funktion außerhalb definieren, um Infinite Loops zu vermeiden
const stableT = (key) => key;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../src/api/recipeApi', () => ({
  getAllRecipes: vi.fn(),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const authLoggedIn = { user: { id: 1 } };
const authLoggedOut = { user: null };

describe('RecipesCards Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderCards = (authValue = authLoggedIn, props = {}) =>
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <RecipesCards {...props} />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('shows login prompt when user is not logged in', () => {
    renderCards(authLoggedOut);
    expect(screen.getByText('recipesCards.loginTitle')).toBeInTheDocument();
    expect(getAllRecipes).not.toHaveBeenCalled();
  });

  it('shows loading initially before API resolves', () => {
    getAllRecipes.mockImplementation(() => new Promise(() => {}));
    renderCards();
    expect(screen.getByText('recipesCards.loading')).toBeInTheDocument();
  });

  it('shows error title when API fails', async () => {
    getAllRecipes.mockRejectedValue(new Error('boom'));
    renderCards();
    
    // findByText ist die sauberere Variante für waitFor + getByText
    expect(await screen.findByText('recipesCards.errorTitle')).toBeInTheDocument();
  });

  it('shows empty state when no recipes exist', async () => {
    getAllRecipes.mockResolvedValue([]);
    renderCards();

    // Wir warten, bis der Ladezustand verschwindet und der Empty-State erscheint
    expect(await screen.findByText('recipesCards.emptyTitle')).toBeInTheDocument();
    expect(screen.getByText('recipesCards.emptyText')).toBeInTheDocument();
  });

  it('navigates to create recipe on empty-state button click', async () => {
    getAllRecipes.mockResolvedValue([]);
    renderCards();

    const btn = await screen.findByText('recipesCards.btnCreate');
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith('/createRecipe');
  });

  it('renders recipe cards when data is loaded', async () => {
    getAllRecipes.mockResolvedValue([
      { id: 1, name: 'Pasta', total_calories: 400 },
      { id: 2, name: 'Salad', total_calories: 200 },
    ]);
    renderCards();

    expect(await screen.findByText('Pasta')).toBeInTheDocument();
    expect(screen.getByText('Salad')).toBeInTheDocument();
  });

  it('respects the limit prop when rendering cards', async () => {
    getAllRecipes.mockResolvedValue([
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 3, name: 'C' },
    ]);
    renderCards(authLoggedIn, { limit: 2 });

    expect(await screen.findByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText('C')).not.toBeInTheDocument();
  });

  it('calls onCountChange with total recipe count', async () => {
    const onCountChange = vi.fn();
    getAllRecipes.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    renderCards(authLoggedIn, { onCountChange });

    await waitFor(() => expect(onCountChange).toHaveBeenCalledWith(2));
  });

  it('navigates to recipe detail on view button click', async () => {
    getAllRecipes.mockResolvedValue([{ id: 7, name: 'Pizza' }]);
    renderCards();

    const viewBtn = await screen.findByText('recipesCards.btnView');
    fireEvent.click(viewBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/recipes/7');
  });
});