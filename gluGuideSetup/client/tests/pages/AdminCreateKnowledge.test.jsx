import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminCreateKnowledge from '../../src/pages/AdminCreateKnowledge';
import axiosInstance from '../../src/api/axiosConfig';



const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../src/api/axiosConfig', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));


vi.mock('../../src/components/AdminKnowledgeForm', () => ({
  default: ({ onSubmit, isLoading }) => (
    <div data-testid="mock-form">
      <button 
        onClick={() => onSubmit({ title: 'Test Article', content: 'Test Body' })}
        disabled={isLoading}
      >
        Submit Form
      </button>
      {isLoading && <span>Loading...</span>}
    </div>
  ),
}));

describe('AdminCreateKnowledge Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders correctly with the title', () => {
    render(
      <MemoryRouter>
        <AdminCreateKnowledge />
      </MemoryRouter>
    );

    expect(screen.getByText('adminCreateKnowledge.title')).toBeInTheDocument();

    expect(screen.getByTestId('mock-form')).toBeInTheDocument();
  });

  it('handles successful article creation and navigates to admin page', async () => {
    axiosInstance.post.mockResolvedValue({ status: 201 });

    render(
      <MemoryRouter>
        <AdminCreateKnowledge />
      </MemoryRouter>
    );

    const submitBtn = screen.getByText('Submit Form');
    fireEvent.click(submitBtn);

    expect(axiosInstance.post).toHaveBeenCalledWith('/admin/knowledge', {
      title: 'Test Article',
      content: 'Test Body',
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('shows an alert and handles error on API failure', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    axiosInstance.post.mockRejectedValue(new Error('API Error'));

    render(
      <MemoryRouter>
        <AdminCreateKnowledge />
      </MemoryRouter>
    );

    const submitBtn = screen.getByText('Submit Form');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('adminCreateKnowledge.error');
    });
    
    expect(mockNavigate).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('disables the form/shows loading state during submission', async () => {

    axiosInstance.post.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <AdminCreateKnowledge />
      </MemoryRouter>
    );

    const submitBtn = screen.getByText('Submit Form');
    fireEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});