import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FoodItemInput from '../../src/components/FoodItemInput';

vi.mock('../../src/components/SearchFoodItem', () => ({
  default: ({ onAdd }) => (
    <div data-testid="mock-search" onClick={() => onAdd({ name: 'Banana' })}>
      SearchFoodItem
    </div>
  ),
}));

describe('FoodItemInput Component', () => {
  it('renders SearchFoodItem child', () => {
    render(<FoodItemInput onAdd={vi.fn()} />);
    expect(screen.getByTestId('mock-search')).toBeInTheDocument();
  });

  it('passes onAdd prop through to SearchFoodItem', () => {
    const onAdd = vi.fn();
    render(<FoodItemInput onAdd={onAdd} />);
    screen.getByTestId('mock-search').click();
    expect(onAdd).toHaveBeenCalledWith({ name: 'Banana' });
  });
});
