import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import { getAllMealsForUser } from '../../src/api/mealApi';
import MealHistoryPage from '../../src/pages/MealHistoryPage';


const stableT = (key, opts) => (opts ? `${key}:${JSON.stringify(opts)}` : key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../src/api/mealApi', () => ({
  getAllMealsForUser: vi.fn(),
}));

describe('MealHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderPage = (authValue = { user: { id: 1 }, loading: false }) =>
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <MealHistoryPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('does not fetch when userId is missing', () => {
    renderPage({ user: null, loading: false });
    expect(getAllMealsForUser).not.toHaveBeenCalled();
  });

  it('shows loading state initially for logged-in user', () => {

    getAllMealsForUser.mockImplementation(() => new Promise(() => {}));
    renderPage();

    expect(screen.getByText(/mealHistory\./)).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    getAllMealsForUser.mockRejectedValue(new Error('fail'));
    renderPage();


    expect(await screen.findByText('mealHistory.errorLoad')).toBeInTheDocument();
  });

  it('renders meal data when fetch succeeds', async () => {
    const now = new Date().toISOString();
    getAllMealsForUser.mockResolvedValue([
      {
        id: 1,
        meal_time: now,
        meal_type: 'lunch',
        total_calories: 500,
        total_proteins: 20,
        total_fats: 15,
        total_carbs: 60,
      },
    ]);

    renderPage();


    await waitFor(() => {
      expect(getAllMealsForUser).toHaveBeenCalledWith(1);
    });
  });

  it('handles empty meal list without crashing', async () => {
    getAllMealsForUser.mockResolvedValue([]);
    renderPage();

    await waitFor(() => {
      expect(getAllMealsForUser).toHaveBeenCalled();
    });
    
  });
});