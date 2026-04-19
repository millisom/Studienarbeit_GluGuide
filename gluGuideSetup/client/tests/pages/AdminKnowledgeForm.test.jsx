import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminKnowledgeForm from '../../src/components/AdminKnowledgeForm';



vi.mock('react-quill', () => ({
  default: ({ value, onChange }) => (
    <textarea
      data-testid="quill-mock"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="fa-icon" />
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

global.URL.createObjectURL = vi.fn(() => 'mock-image-url');

describe('AdminKnowledgeForm Component', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillRequiredFields = () => {
    fireEvent.change(screen.getByPlaceholderText('adminKnowledgeForm.categoryPlaceholderDe'), { target: { value: 'Kat DE' } });
    fireEvent.change(screen.getByPlaceholderText('adminKnowledgeForm.titlePlaceholderDe'), { target: { value: 'Titel DE' } });
    fireEvent.change(screen.getByPlaceholderText('adminKnowledgeForm.categoryPlaceholderEn'), { target: { value: 'Cat EN' } });
    fireEvent.change(screen.getByPlaceholderText('adminKnowledgeForm.titlePlaceholderEn'), { target: { value: 'Title EN' } });
  };

  it('renders all required input fields', () => {
    render(<AdminKnowledgeForm onSubmit={mockOnSubmit} isLoading={false} />);
    expect(screen.getByPlaceholderText('adminKnowledgeForm.titlePlaceholderDe')).toBeInTheDocument();
    expect(screen.getAllByTestId('quill-mock')).toHaveLength(4);
  });

  it('populates fields correctly with initialData', () => {
    const initialData = {
      title_de: 'Bestehender Titel',
      tags: ['Diabetes', 'Tipps'],
      image_url: 'test.jpg'
    };
    render(<AdminKnowledgeForm initialData={initialData} onSubmit={mockOnSubmit} isLoading={false} />);
    expect(screen.getByDisplayValue('Bestehender Titel')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Diabetes, Tipps')).toBeInTheDocument();
  });

  it('handles file selection and shows preview', () => {
    const { container } = render(<AdminKnowledgeForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });

    const fileInput = container.querySelector('input[type="file"]');

    fireEvent.change(fileInput, { target: { files: [file] } });

    const previewImg = screen.getByAltText('adminKnowledgeForm.preview');
    expect(previewImg).toBeInTheDocument();
    expect(previewImg).toHaveAttribute('src', 'mock-image-url');
  });

  it('submits correctly formatted FormData (including JSON tags)', async () => {
    render(<AdminKnowledgeForm onSubmit={mockOnSubmit} isLoading={false} />);

    fillRequiredFields();
    

    fireEvent.change(screen.getByPlaceholderText('adminKnowledgeForm.tagsPlaceholder'), { 
      target: { value: 'Tag1, Tag2' } 
    });
    

    const submitBtn = screen.getByRole('button', { name: /adminEditPost\.btnSave/i });
    fireEvent.click(submitBtn);


    expect(mockOnSubmit).toHaveBeenCalled();
    
    const formData = mockOnSubmit.mock.calls[0][0];
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get('title_de')).toBe('Titel DE');
    

    expect(formData.get('tags')).toBe(JSON.stringify(['Tag1', 'Tag2']));
  });

  it('disables submit button and shows saving state when isLoading is true', () => {
    render(<AdminKnowledgeForm onSubmit={mockOnSubmit} isLoading={true} />);
    const submitBtn = screen.getByRole('button');
    expect(submitBtn).toBeDisabled();
    expect(screen.getByText('adminEditPost.btnSaving')).toBeInTheDocument();
  });
});