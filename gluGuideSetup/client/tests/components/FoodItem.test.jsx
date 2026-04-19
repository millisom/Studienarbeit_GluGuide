import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FoodItem from '../../src/components/FoodItem';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

describe('FoodItem Component', () => {
  const food = {
    name: 'Apple',
    calories: 52,
    carbs: 14,
    proteins: 0.3,
    fats: 0.2,
  };

  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders food name and nutrition facts', () => {
    render(<FoodItem food={food} onAdd={vi.fn()} />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText(/52 kcal/)).toBeInTheDocument();
    expect(screen.getByText(/14g/)).toBeInTheDocument();
  });

  it('calls onAdd with quantity when user adds a valid amount', () => {
    const onAdd = vi.fn();
    render(<FoodItem food={food} onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('foodItem.placeholder');
    fireEvent.change(input, { target: { value: '100' } });
    fireEvent.click(screen.getByText('+'));

    expect(onAdd).toHaveBeenCalledWith({ ...food, quantity_in_grams: 100 });
  });

  it('shows alert and does not call onAdd for invalid input', () => {
    const onAdd = vi.fn();
    render(<FoodItem food={food} onAdd={onAdd} />);

    fireEvent.click(screen.getByText('+'));
    expect(window.alert).toHaveBeenCalled();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('shows alert for zero or negative quantity', () => {
    const onAdd = vi.fn();
    render(<FoodItem food={food} onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('foodItem.placeholder');
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.click(screen.getByText('+'));

    expect(window.alert).toHaveBeenCalled();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('resets quantity input after successful add', () => {
    render(<FoodItem food={food} onAdd={vi.fn()} />);

    const input = screen.getByPlaceholderText('foodItem.placeholder');
    fireEvent.change(input, { target: { value: '50' } });
    fireEvent.click(screen.getByText('+'));

    expect(input.value).toBe('');
  });
});
