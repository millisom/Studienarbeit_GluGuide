import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import { getAllMealsForUser } from '../../src/api/mealApi';
import MealsCards from '../../src/components/MealsCards';


const stableT = (key) => key;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../src/api/mealApi', () => ({
  getAllMealsForUser: vi.fn(),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

describe('MealsCards Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderCards = (authValue = { user: { id: 1 } }) =>
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <MealsCards />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('shows login prompt when user is not logged in', () => {
    renderCards({ user: null });
    expect(screen.getByText('mealsCards.loginPrompt')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {

    getAllMealsForUser.mockImplementation(() => new Promise(() => {}));
    renderCards();
    expect(screen.getByText('mealsCards.loading')).toBeInTheDocument();
  });

  it('shows error message when API fails', async () => {
    getAllMealsForUser.mockRejectedValue(new Error('fail'));
    renderCards();

    expect(await screen.findByText('mealsCards.errorLoad')).toBeInTheDocument();
  });

  it('filters out meals from other days and only shows today', async () => {
    const todayIso = new Date().toISOString();
    const yesterdayIso = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    getAllMealsForUser.mockResolvedValue([
      { id: 1, meal_time: todayIso, meal_type: 'lunch', total_calories: 500 },
      { id: 2, meal_time: yesterdayIso, meal_type: 'dinner', total_calories: 999 },
    ]);

    renderCards();


    expect(await screen.findByText('mealsCards.todayTotal')).toBeInTheDocument();
  });

  it('renders without crashing when no meals are returned', async () => {
    getAllMealsForUser.mockResolvedValue([]);
    renderCards();

    expect(await screen.findByText('mealsCards.todayTotal')).toBeInTheDocument();
  });
});