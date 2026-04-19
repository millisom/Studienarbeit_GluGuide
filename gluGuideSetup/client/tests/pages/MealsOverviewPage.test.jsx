import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MealsOverviewPage from '../../src/pages/MealsOverviewPage';
import { AuthContext } from '../../src/context/AuthContext';



const stableT = (key) => key;
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../src/pages/LogMealPage', () => ({
  default: ({ onMealLogged }) => (
    <button data-testid="mock-log-meal" onClick={onMealLogged}>
      Mock Log Meal
    </button>
  ),
}));

vi.mock('../../src/components/MealsCards', () => ({
  default: ({ refreshTrigger }) => (
    <div data-testid="mock-meals-cards">Refresh Trigger: {refreshTrigger}</div>
  ),
}));

vi.mock('../../src/components/RecipesCards', () => ({
  default: ({ limit, onCountChange }) => {
    React.useEffect(() => {
      onCountChange(12);
    }, [onCountChange]);
    return <div data-testid="mock-recipes-cards">Limit: {limit || 'none'}</div>;
  },
}));

describe('MealsOverviewPage', () => {
  const mockAuthValue = {
    user: { id: 1, username: 'testuser' },
    loading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () =>
    render(
      <AuthContext.Provider value={mockAuthValue}>
        <MemoryRouter>
          <MealsOverviewPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('renders correctly with title and sections', () => {
    renderPage();
    expect(screen.getByText('mealsOverview.title')).toBeInTheDocument();
    expect(screen.getByText('mealsOverview.logMealTitle')).toBeInTheDocument();
  });

  it('navigates to create recipe page when button clicked', () => {
    renderPage();
    const createBtn = screen.getByText('mealsOverview.btnCreateRecipe');
    fireEvent.click(createBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/createRecipe');
  });

  it('increments refreshKey when a meal is logged', () => {
    renderPage();
    const mealsCards = screen.getByTestId('mock-meals-cards');
    expect(mealsCards).toHaveTextContent('Refresh Trigger: 0');

    const logMealBtn = screen.getByTestId('mock-log-meal');
    fireEvent.click(logMealBtn);

    expect(mealsCards).toHaveTextContent('Refresh Trigger: 1');
  });

  it('handles "See More" logic for recipes', () => {
    renderPage();
    const recipesCards = screen.getByTestId('mock-recipes-cards');
    expect(recipesCards).toHaveTextContent('Limit: 9');

    const seeMoreBtn = screen.getByText('mealsOverview.btnSeeMore');
    fireEvent.click(seeMoreBtn);

    expect(recipesCards).toHaveTextContent('Limit: none');
  });
});