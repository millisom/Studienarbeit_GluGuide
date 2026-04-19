import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RecipeCardRoute from '../../src/components/RecipeCardRoute';

vi.mock('../../src/components/RecipeCard', () => ({
  default: ({ recipeId }) => <div data-testid="recipe-card">Recipe ID: {recipeId}</div>,
}));

describe('RecipeCardRoute Component', () => {
  it('passes id param to RecipeCard', () => {
    render(
      <MemoryRouter initialEntries={['/recipes/42']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeCardRoute />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('recipe-card')).toHaveTextContent('42');
  });
});
