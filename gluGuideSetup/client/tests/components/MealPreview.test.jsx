import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MealPreview from '../../src/components/MealPreview';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, opts) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
    i18n: { language: 'en' },
  }),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

describe('MealPreview Component', () => {
  it('renders empty state when no items and no recipe', () => {
    render(
      <MealPreview
        items={[]}
        selectedRecipe={null}
        onRemove={vi.fn()}
        onRemoveRecipe={vi.fn()}
      />
    );
    expect(screen.getByText('mealPreview.emptyTitle')).toBeInTheDocument();
    expect(screen.getByText('mealPreview.emptySubtext')).toBeInTheDocument();
  });

  it('renders food items with quantity', () => {
    const items = [
      { name: 'Apple', quantity_in_grams: 100 },
      { name: 'Bread', quantity_in_grams: 50 },
    ];
    render(
      <MealPreview
        items={items}
        selectedRecipe={null}
        onRemove={vi.fn()}
        onRemoveRecipe={vi.fn()}
      />
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Bread')).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('renders selected recipe when provided', () => {
    render(
      <MealPreview
        items={[]}
        selectedRecipe={{ id: 1, name: 'Salad' }}
        onRemove={vi.fn()}
        onRemoveRecipe={vi.fn()}
      />
    );
    expect(screen.getByText('Salad')).toBeInTheDocument();
  });

  it('calls onRemove with correct index', () => {
    const onRemove = vi.fn();
    const items = [
      { name: 'Apple', quantity_in_grams: 100 },
      { name: 'Bread', quantity_in_grams: 50 },
    ];
    render(
      <MealPreview
        items={items}
        selectedRecipe={null}
        onRemove={onRemove}
        onRemoveRecipe={vi.fn()}
      />
    );
    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[1]);
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('calls onRemoveRecipe when recipe remove clicked', () => {
    const onRemoveRecipe = vi.fn();
    render(
      <MealPreview
        items={[]}
        selectedRecipe={{ id: 1, name: 'Salad' }}
        onRemove={vi.fn()}
        onRemoveRecipe={onRemoveRecipe}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onRemoveRecipe).toHaveBeenCalled();
  });
});
