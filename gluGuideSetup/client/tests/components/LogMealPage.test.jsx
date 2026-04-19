import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom'; // Import hinzugefügt
import LogMealPage from '../../src/pages/LogMealPage';
import { createMeal, recalculateMealNutrition, getAllMealsForUser } from '../../src/api/mealApi';
import axiosInstance from '../../src/api/axiosConfig';
import { AuthContext } from '../../src/context/AuthContext';

// --- Mocks ---
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() }
  }),
  Trans: ({ children }) => children
}));

vi.mock('../../src/api/mealApi', () => ({
  createMeal: vi.fn(),
  recalculateMealNutrition: vi.fn(),
  getAllMealsForUser: vi.fn(),
}));

vi.mock('../../src/api/axiosConfig', () => ({
  default: { 
    post: vi.fn(),
    get: vi.fn()
  }
}));

vi.mock('react-quill', () => ({
  default: ({ onChange }) => (
    <textarea data-testid="mock-quill" onChange={(e) => onChange(e.target.value)} />
  )
}));

vi.mock('../../src/components/FoodItemInput', () => ({
  default: ({ onAdd }) => (
    <button data-testid="mock-add-food" onClick={() => onAdd({ name: 'Apple', calories: 95 })}>
      Add Apple
    </button>
  )
}));

vi.mock('../../src/components/RecipeSelector', () => ({
  default: ({ onSelect }) => (
    <button data-testid="mock-add-recipe" onClick={() => onSelect({ id: 1, name: 'Salad', quantity: 1 })}>
      Add Recipe
    </button>
  )
}));

vi.mock('../../src/components/MealPreview', () => ({
  default: () => <div data-testid="mock-meal-preview">Meal Preview</div>
}));

// --- Tests ---
describe('LogMealPage Component', () => {
  const mockAuthValue = { user: { id: 69, username: 'TestUser' } };

  beforeEach(() => {
    vi.clearAllMocks();
    getAllMealsForUser.mockResolvedValue([]);
    createMeal.mockResolvedValue({ meal_id: 100 });
    axiosInstance.post.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderPage = async () => {
    let result;
    await act(async () => {
      result = render(
        <MemoryRouter> {/* Router hinzugefügt */}
          <AuthContext.Provider value={mockAuthValue}>
            <LogMealPage onMealLogged={vi.fn()} />
          </AuthContext.Provider>
        </MemoryRouter>
      );
    });
    return result;
  };

  it('prevents submission if submitted without meal type', async () => {
    await renderPage();
    
    const saveBtn = screen.getByText('logMeal.btnSave');
    
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(createMeal).not.toHaveBeenCalled();
  });

  it('successfully saves a meal with reminder flag', async () => {
    await renderPage();

    // Mahlzeitentyp wählen
    const select = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(select, { target: { value: 'lunch' } });
    });

    // Lebensmittel hinzufügen
    await act(async () => {
      fireEvent.click(screen.getByTestId('mock-add-food'));
    });

    // Reminder aktivieren
    const reminderCheckbox = screen.getByLabelText(/logMeal\.labelReminder/i);
    await act(async () => {
      fireEvent.click(reminderCheckbox);
    });

    // Speichern
    const saveBtn = screen.getByText('logMeal.btnSave');
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // Verifizierung
    expect(createMeal).toHaveBeenCalledWith(
      expect.objectContaining({ request_reminder: true, meal_type: 'lunch' })
    );

    await waitFor(() => {
      expect(screen.getByText('logMeal.success')).toBeInTheDocument();
    });
  });
});