import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RecipeSummaryPage from '../../src/pages/RecipeSummaryPage';


vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));


vi.mock('../../src/components/RecipesCards', () => ({
  default: () => <div data-testid="mock-recipes-cards">Mocked Recipes Cards</div>,
}));


vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

describe('RecipeSummaryPage', () => {
  it('renders correctly with title and icon', () => {
    render(<RecipeSummaryPage />);


    expect(screen.getByText('recipeSummary.title')).toBeInTheDocument();
    

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('contains the RecipesCards component', () => {
    render(<RecipeSummaryPage />);


    const recipesCards = screen.getByTestId('mock-recipes-cards');
    expect(recipesCards).toBeInTheDocument();
    expect(recipesCards).toHaveTextContent('Mocked Recipes Cards');
  });

  it('has the correct container class applied', () => {
    const { container } = render(<RecipeSummaryPage />);
    

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('recipesSummaryPageContainer');
  });
});