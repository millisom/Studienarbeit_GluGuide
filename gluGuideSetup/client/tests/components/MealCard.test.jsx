import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MealCard from '../../src/components/MealCard';
import { getMealById, deleteMeal, updateMeal } from '../../src/api/mealApi';
import { AuthContext } from '../../src/context/AuthContext';

// --- Mocks ---

// Stabile t-Funktion, um Endlosschleifen im useEffect zu verhindern
const stableT = (key, params) => {
  if (params?.name) return `baseRecipe: ${params.name}`;
  return key;
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
    i18n: { language: 'de' }
  })
}));

vi.mock('../../src/api/mealApi', () => ({
  getMealById: vi.fn(),
  deleteMeal: vi.fn(),
  updateMeal: vi.fn(),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock Daten
const mockMeal = {
  id: 'meal-123',
  meal_type: 'lunch',
  meal_time: '2023-10-27T12:00:00.000Z',
  total_calories: 500.5,
  total_proteins: 30.2,
  total_fats: 15.0,
  total_carbs: 55.1,
  notes: '<p>Sehr lecker</p>',
  items: [
    { food_id: 1, name: 'Hähnchen', quantity_in_grams: 200 },
    { food_id: 2, name: 'Reis', quantity_in_grams: 150 }
  ],
  recipe_snapshot: { name: 'Fitness Pfanne' }
};

const mockAuthValue = {
  user: { id: 1, username: 'TestUser' }
};

describe('MealCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = (props = { mealId: 'meal-123' }) => render(
    <AuthContext.Provider value={mockAuthValue}>
      <MemoryRouter>
        <MealCard {...props} />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  it('shows loading state initially', () => {
    getMealById.mockImplementation(() => new Promise(() => {})); // Bleibt im Status pending
    renderComponent();
    expect(screen.getByText('mealCard.loading')).toBeInTheDocument();
  });

  it('renders meal details correctly after fetching', async () => {
    getMealById.mockResolvedValue(mockMeal);
    renderComponent();

    // Warten bis Daten geladen sind
    expect(await screen.findByText(/LUNCH/i)).toBeInTheDocument();
    expect(screen.getByText(/500.5 kcal/i)).toBeInTheDocument();
    expect(screen.getByText('Hähnchen')).toBeInTheDocument();
    expect(screen.getByText('Sehr lecker')).toBeInTheDocument();
  });

  it('shows error message if fetch fails', async () => {
    getMealById.mockRejectedValue(new Error('Fetch failed'));
    renderComponent();

    expect(await screen.findByText('mealCard.errorLoad')).toBeInTheDocument();
  });

  it('enters edit mode and changes ingredient quantity', async () => {
    getMealById.mockResolvedValue(mockMeal);
    renderComponent();

    const editBtn = await screen.findByText('mealCard.btnEdit');
    fireEvent.click(editBtn);

    // Prüfen, ob Input-Felder erscheinen
    const inputs = screen.getAllByRole('spinbutton'); // Die Number-Inputs für Gramm
    expect(inputs).toHaveLength(2);

    fireEvent.change(inputs[0], { target: { value: '250' } });
    expect(inputs[0].value).toBe('250');
  });

  it('saves edits and reloads data', async () => {
    getMealById.mockResolvedValue(mockMeal);
    updateMeal.mockResolvedValue({ success: true });
    
    renderComponent();

    const editBtn = await screen.findByText('mealCard.btnEdit');
    fireEvent.click(editBtn);

    const saveBtn = screen.getByText('mealCard.btnSave');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateMeal).toHaveBeenCalled();
      expect(getMealById).toHaveBeenCalledTimes(2); // Einmal initial, einmal nach dem Speichern
    });
    expect(screen.getByText('mealCard.updateSuccess')).toBeInTheDocument();
  });

  it('cancels edit mode without saving', async () => {
    getMealById.mockResolvedValue(mockMeal);
    renderComponent();

    const editBtn = await screen.findByText('mealCard.btnEdit');
    fireEvent.click(editBtn);

    const cancelBtn = screen.getByText('mealCard.btnCancel');
    fireEvent.click(cancelBtn);

    // Sollte wieder den Edit-Button zeigen statt Save/Cancel
    expect(screen.getByText('mealCard.btnEdit')).toBeInTheDocument();
    expect(screen.queryByText('mealCard.btnSave')).not.toBeInTheDocument();
  });

  it('deletes meal after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    getMealById.mockResolvedValue(mockMeal);
    deleteMeal.mockResolvedValue({ success: true });

    renderComponent();

    const deleteBtn = await screen.findByText('mealCard.btnDelete');
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalledWith('mealCard.confirmDelete');
    
    await waitFor(() => {
      expect(deleteMeal).toHaveBeenCalledWith('meal-123');
      expect(screen.getByText('mealCard.deleteSuccess')).toBeInTheDocument();
    });

    // Nach 1.5 Sekunden sollte navigiert werden
    vi.advanceTimersByTime(1500);
    expect(mockNavigate).toHaveBeenCalledWith('/meals');
  });
});