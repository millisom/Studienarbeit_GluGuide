import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import IngredientList from '../../src/components/IngedientsList';


const stableT = (key) => key;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
    i18n: { language: 'en' },
  }),
}));

describe('IngredientList Component', () => {
  it('renders empty list without crashing', () => {
    render(<IngredientList ingredients={[]} onRemove={vi.fn()} />);
    expect(screen.getByText('ingredientList.title')).toBeInTheDocument();
  });

  it('renders all ingredients with name and quantity', () => {
    const ingredients = [
      { name: 'Tomato', quantity: '2' },
      { name: 'Pasta', quantity: '200g' },
    ];
    render(<IngredientList ingredients={ingredients} onRemove={vi.fn()} />);

    expect(screen.getByText(/Tomato/i)).toBeInTheDocument();
    expect(screen.getByText(/Pasta/i)).toBeInTheDocument();


    expect(screen.getByText(/Tomato.*2/i)).toBeInTheDocument();
    expect(screen.getByText(/Pasta.*200g/i)).toBeInTheDocument();
  });

  it('falls back to customQuantity translation when no quantity given', () => {
    const ingredients = [{ name: 'Salt' }];
    render(<IngredientList ingredients={ingredients} onRemove={vi.fn()} />);
    expect(screen.getByText(/ingredientList.customQuantity/)).toBeInTheDocument();
  });

  it('calls onRemove with correct index when ✕ button clicked', () => {
    const onRemove = vi.fn();
    const ingredients = [
      { name: 'Tomato', quantity: '2' },
      { name: 'Pasta', quantity: '200g' },
    ];
    render(<IngredientList ingredients={ingredients} onRemove={onRemove} />);

    const buttons = screen.getAllByText('✕');
    fireEvent.click(buttons[1]);
    expect(onRemove).toHaveBeenCalledWith(1);
  });
});