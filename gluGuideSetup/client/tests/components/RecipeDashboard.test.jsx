import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RecipeDashboard from '../../src/components/RecipeDashboard';
import { createRecipe, updateRecipe, getRecipeById } from '../../src/api/recipeApi';
import { AuthContext } from '../../src/context/AuthContext';


const stableT = (key) => key;
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
    i18n: { language: 'en' }
  }),
  Trans: ({ children }) => children
}));

vi.mock('../../src/api/recipeApi', () => ({
  createRecipe: vi.fn(),
  updateRecipe: vi.fn(),
  getRecipeById: vi.fn()
}));

vi.mock('../../src/components/SearchFoodItem', () => ({
  default: ({ onAdd }) => (
    <button data-testid="mock-add-food" onClick={() => onAdd({ name: 'Apple', calories: 95 })}>
      Add Apple
    </button>
  )
}));

vi.mock('../../src/components/RecipeInstructionsInput', () => ({
  default: ({ setInstructions }) => (
    <button data-testid="mock-set-instructions" onClick={() => setInstructions(['Step 1'])}>
      Add Instruction
    </button>
  )
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});


describe('RecipeDashboard Component', () => {
  const mockAuthUser = { user: { id: 1, username: 'testuser' } };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderDashboard = (path = '/create', authValue = mockAuthUser) => {
    return render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/create" element={<RecipeDashboard />} />
            <Route path="/edit/:id" element={<RecipeDashboard />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it('shows login prompt when user is not authenticated', () => {
    renderDashboard('/create', { user: null });
    expect(screen.getByText('recipeDashboard.title')).toBeInTheDocument();
    expect(screen.getByText(/log in/i)).toBeInTheDocument();
  });

  it('renders correctly in create mode', () => {
    renderDashboard('/create');
    expect(screen.getByText('recipeDashboard.title')).toBeInTheDocument();
  });

  it('loads existing recipe data in edit mode', async () => {
    getRecipeById.mockResolvedValue({
      name: 'Old Recipe',
      ingredients: [{ name: 'Ingredient 1' }],
      instructions: ['Step 1']
    });

    renderDashboard('/edit/123');

    const nameInput = await screen.findByDisplayValue('Old Recipe');
    expect(nameInput).toBeInTheDocument();
  });

  it('shows validation error when fields are empty', async () => {
    renderDashboard('/create');
    fireEvent.click(screen.getByText('recipeDashboard.btnSave'));
    expect(await screen.findByText('recipeDashboard.errorName')).toBeInTheDocument();
  });

  it('creates a recipe successfully and navigates', async () => {
    createRecipe.mockResolvedValue({ id: 789 });
    renderDashboard('/create');

    fireEvent.change(screen.getByPlaceholderText('recipeDashboard.placeholderName'), {
      target: { value: 'New Recipe' }
    });
    fireEvent.click(screen.getByTestId('mock-add-food'));
    fireEvent.click(screen.getByTestId('mock-set-instructions'));

    fireEvent.click(screen.getByText('recipeDashboard.btnSave'));

    await waitFor(() => {
      expect(createRecipe).toHaveBeenCalled();
      expect(screen.getByText('recipeDashboard.success')).toBeInTheDocument();
    });

    vi.advanceTimersByTime(1000);
    expect(mockNavigate).toHaveBeenCalledWith('/recipes/789');
  });

  it('updates a recipe successfully in edit mode', async () => {
    getRecipeById.mockResolvedValue({ 
      name: 'Editable', 
      ingredients: [{ name: 'Tomato' }], 
      instructions: ['Cook it'] 
    });
    updateRecipe.mockResolvedValue({});
    
    renderDashboard('/edit/123');

    const nameInput = await screen.findByDisplayValue('Editable');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    fireEvent.click(screen.getByText('recipeDashboard.btnUpdate'));

    await waitFor(() => {
      expect(updateRecipe).toHaveBeenCalledWith('123', expect.objectContaining({
        name: 'Updated Name'
      }));
      expect(screen.getByText('recipeDashboard.successUpdate')).toBeInTheDocument();
    });

    vi.advanceTimersByTime(1000);
    expect(mockNavigate).toHaveBeenCalledWith('/recipes/123');
  });

  it('handles 403 Forbidden error correctly', async () => {
    getRecipeById.mockRejectedValue({ response: { status: 403 } });
    renderDashboard('/edit/456');
    expect(await screen.findByText('recipeDashboard.errorForbidden')).toBeInTheDocument();
  });

  it('handles general API failure during save', async () => {
    createRecipe.mockRejectedValue(new Error('Network Fail'));
    renderDashboard('/create');

    fireEvent.change(screen.getByPlaceholderText('recipeDashboard.placeholderName'), {
      target: { value: 'Fail Recipe' }
    });
    fireEvent.click(screen.getByTestId('mock-add-food'));
    fireEvent.click(screen.getByTestId('mock-set-instructions'));

    fireEvent.click(screen.getByText('recipeDashboard.btnSave'));

    expect(await screen.findByText('recipeDashboard.errorFailed')).toBeInTheDocument();
  });
});