import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecipeInstructionsInput from '../../src/components/RecipeInstructionsInput';


const stableT = (key, params) => {
  if (params?.index) return `${key} ${params.index}`;
  return key;
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
    i18n: { language: 'de' }
  })
}));

describe('RecipeInstructionsInput Component', () => {
  let mockSetInstructions;

  beforeEach(() => {
    mockSetInstructions = vi.fn();
  });

  it('renders the input field and add button', () => {
    render(<RecipeInstructionsInput instructions={[]} setInstructions={mockSetInstructions} />);
    
    expect(screen.getByPlaceholderText('recipeInstructions.placeholderAdd')).toBeInTheDocument();
    expect(screen.getByText('recipeInstructions.btnAdd')).toBeInTheDocument();
    expect(screen.queryByText('recipeInstructions.currentSteps')).not.toBeInTheDocument();
  });

  it('adds a new step when clicking the add button', () => {
    render(<RecipeInstructionsInput instructions={[]} setInstructions={mockSetInstructions} />);
    
    const input = screen.getByPlaceholderText('recipeInstructions.placeholderAdd');
    const addBtn = screen.getByText('recipeInstructions.btnAdd');

    fireEvent.change(input, { target: { value: 'First Step' } });
    fireEvent.click(addBtn);

    expect(mockSetInstructions).toHaveBeenCalledWith(['First Step']);
    expect(input.value).toBe(''); 
  });

  it('adds a new step when pressing the Enter key', () => {
    render(<RecipeInstructionsInput instructions={[]} setInstructions={mockSetInstructions} />);
    
    const input = screen.getByPlaceholderText('recipeInstructions.placeholderAdd');

    fireEvent.change(input, { target: { value: 'Enter Step' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockSetInstructions).toHaveBeenCalledWith(['Enter Step']);
  });

  it('does not add an empty step', () => {
    render(<RecipeInstructionsInput instructions={[]} setInstructions={mockSetInstructions} />);
    
    const addBtn = screen.getByText('recipeInstructions.btnAdd');
    fireEvent.click(addBtn);

    expect(mockSetInstructions).not.toHaveBeenCalled();
  });

  it('renders existing steps correctly', () => {
    const instructions = ['Schritt 1', 'Schritt 2'];
    render(<RecipeInstructionsInput instructions={instructions} setInstructions={mockSetInstructions} />);

    expect(screen.getByText('recipeInstructions.currentSteps')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Schritt 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Schritt 2')).toBeInTheDocument();
    expect(screen.getByText('recipeInstructions.stepLabel 1')).toBeInTheDocument();
    expect(screen.getByText('recipeInstructions.stepLabel 2')).toBeInTheDocument();
  });

  it('calls setInstructions when a step is edited', () => {
    const instructions = ['Original Step'];
    render(<RecipeInstructionsInput instructions={instructions} setInstructions={mockSetInstructions} />);

    const textarea = screen.getByDisplayValue('Original Step');
    fireEvent.change(textarea, { target: { value: 'Updated Step' } });

    expect(mockSetInstructions).toHaveBeenCalledWith(['Updated Step']);
  });

  it('removes a step when clicking the remove button', () => {
    const instructions = ['Step 1', 'Step to Remove', 'Step 3'];
    render(<RecipeInstructionsInput instructions={instructions} setInstructions={mockSetInstructions} />);


    const removeButtons = screen.getAllByText('recipeInstructions.btnRemove');
    fireEvent.click(removeButtons[1]);

    expect(mockSetInstructions).toHaveBeenCalledWith(['Step 1', 'Step 3']);
  });
});