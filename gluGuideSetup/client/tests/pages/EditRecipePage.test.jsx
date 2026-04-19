import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EditRecipePage from '../../src/pages/EditRecipePage';


vi.mock('../../src/components/RecipeDashboard', () => ({
  default: () => <div data-testid="mock-recipe-dashboard">Mocked Recipe Dashboard</div>
}));

describe('EditRecipePage', () => {
  it('renders the RecipeDashboard component', () => {
    render(<EditRecipePage />);


    const dashboard = screen.getByTestId('mock-recipe-dashboard');
    expect(dashboard).toBeInTheDocument();
    expect(dashboard).toHaveTextContent('Mocked Recipe Dashboard');
  });

  it('renders without any extra wrapping elements', () => {
    const { container } = render(<EditRecipePage />);
    

    expect(container.firstChild).toHaveAttribute('data-testid', 'mock-recipe-dashboard');
  });
});