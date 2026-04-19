import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MealCardRoute from '../../src/components/MealCardRoute';

vi.mock('../../src/components/MealCard', () => ({
  default: ({ mealId }) => <div data-testid="meal-card">Meal ID: {mealId}</div>,
}));

describe('MealCardRoute Component', () => {
  it('passes mealId param to MealCard', () => {
    render(
      <MemoryRouter initialEntries={['/meals/99']}>
        <Routes>
          <Route path="/meals/:mealId" element={<MealCardRoute />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('meal-card')).toHaveTextContent('99');
  });
});
