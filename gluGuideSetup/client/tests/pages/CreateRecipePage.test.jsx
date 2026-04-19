import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CreateRecipePage from '../../src/pages/CreateRecipePage';


vi.mock('../../src/components/RecipeDashboard', () => ({
  default: () => <div data-testid="mock-recipe-dashboard">Mocked Recipe Dashboard</div>
}));


vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'de' }
  })
}));

describe('CreateRecipePage', () => {
  it('renders without crashing and contains the RecipeDashboard', () => {
    render(<CreateRecipePage />);


    const dashboard = screen.getByTestId('mock-recipe-dashboard');
    expect(dashboard).toBeInTheDocument();
    expect(dashboard).toHaveTextContent('Mocked Recipe Dashboard');
  });

  it('has the correct container class application', () => {
    const { container } = render(<CreateRecipePage />);
    
    const div = container.firstChild;
    expect(div).toBeInTheDocument();
    expect(div).toHaveClass('container'); 
  });
});