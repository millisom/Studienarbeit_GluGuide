import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LogMealPage from '../../src/pages/LogMealPage';
import { createMeal, recalculateMealNutrition, getAllMealsForUser } from '../../src/api/mealApi';
import axiosInstance from '../../src/api/axiosConfig';
import { AuthContext } from '../../src/context/AuthContext';


vi.mock('../../src/api/mealApi', () => ({
  createMeal: vi.fn(),
  recalculateMealNutrition: vi.fn(),
  getAllMealsForUser: vi.fn(),
}));

vi.mock('../../src/api/axiosConfig', () => ({
  default: {
    post: vi.fn(),
  }
}));


vi.mock('react-quill', () => ({
  default: ({ onChange }) => <textarea data-testid="mock-quill" onChange={(e) => onChange(e.target.value)} />
}));

vi.mock('../../src/components/FoodItemInput', () => ({
  default: ({ onAdd }) => <button data-testid="mock-add-food" onClick={() => onAdd({ name: 'Apple', calories: 95 })}>Add Apple</button>
}));

vi.mock('../../src/components/RecipeSelector', () => ({
  default: ({ onSelect }) => <button data-testid="mock-add-recipe" onClick={() => onSelect({ id: 1, name: 'Salad', quantity: 1 })}>Add Recipe</button>
}));

vi.mock('../../src/components/MealPreview', () => ({
  default: () => <div data-testid="mock-meal-preview">Meal Preview</div>
}));

describe('LogMealPage Component', () => {
  const mockAuthValue = {
    user: { id: 69, username: 'TestUser' }
  };

  const renderComponent = () => {
    return render(
      <AuthContext.Provider value={mockAuthValue}>
        <LogMealPage onMealLogged={vi.fn()} />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-28T12:00:00Z'));
    

    getAllMealsForUser.mockResolvedValue([]);
    createMeal.mockResolvedValue({ meal_id: 100 });
    recalculateMealNutrition.mockResolvedValue({});
    axiosInstance.post.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

it('shows validation error if submitted without meal type', async () => {
    renderComponent();
    
    const form = screen.getByText('Save Meal').closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Please select a meal type')).toBeInTheDocument();
    });
  });

  it('shows validation error if submitted without food or recipe', async () => {
    renderComponent();
    

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'lunch' } });
    

    fireEvent.click(screen.getByText('Save Meal'));

    await waitFor(() => {
      expect(screen.getByText('Please add food or a recipe')).toBeInTheDocument();
    });
  });

  it('calculates the correct snack number based on past meals', async () => {

    const today = new Date().toISOString();
    getAllMealsForUser.mockResolvedValue([
      { meal_time: today, meal_type: 'snack' },
      { meal_time: today, meal_type: 'snack' },
      { meal_time: today, meal_type: 'lunch' } // Shouldn't count
    ]);

    renderComponent();
    

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'snack' } });


    await waitFor(() => {
      expect(screen.getByText('Snack 3')).toBeInTheDocument();
    });
  });

  it('successfully saves a meal AND schedules the 1-hour database alert', async () => {
    renderComponent();
    

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'lunch' } });


    fireEvent.click(screen.getByTestId('mock-add-food'));


    const reminderCheckbox = screen.getByLabelText(/Remind me to test my glucose in 1 hour/i);
    fireEvent.click(reminderCheckbox);


    fireEvent.click(screen.getByText('Save Meal'));


    await waitFor(() => {
      expect(createMeal).toHaveBeenCalledWith(expect.objectContaining({
        meal_type: 'lunch',
        request_reminder: true,
        items: [{ name: 'Apple', calories: 95 }]
      }));
      expect(recalculateMealNutrition).toHaveBeenCalledWith(100);
    });


    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/alerts', expect.objectContaining({
        userId: 69,
        reminderFrequency: 'once',
        notificationMethod: 'app'
      }));
    });


    expect(screen.getByText('Meal saved successfully!')).toBeInTheDocument();
  });
});