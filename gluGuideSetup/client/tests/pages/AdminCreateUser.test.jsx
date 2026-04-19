import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminCreateUser from '../../src/pages/AdminCreateUser';
import axiosInstance from '../../src/api/axiosConfig';



vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="fa-icon" />
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../src/api/axiosConfig', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, params) => {
      if (params?.username) return `${key} ${params.username}`;
      return key;
    },
  }),
}));

describe('AdminCreateUser Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  const renderComponent = () => render(
    <MemoryRouter>
      <AdminCreateUser />
    </MemoryRouter>
  );


  const fillRequiredFields = () => {
    fireEvent.change(screen.getByPlaceholderText('adminCreateUser.placeholderUsername'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('adminCreateUser.placeholderEmail'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('adminCreateUser.placeholderPassword'), { target: { value: 'password123' } });
  };

  it('renders all input fields and buttons', () => {
    renderComponent();
    expect(screen.getByPlaceholderText('adminCreateUser.placeholderUsername')).toBeInTheDocument();
    expect(screen.getByText('adminCreateUser.btnCreate')).toBeInTheDocument();
  });

  it('shows error if terms are not accepted', async () => {
    renderComponent();
    

    fillRequiredFields();
    
    const submitBtn = screen.getByText('adminCreateUser.btnCreate');
    fireEvent.click(submitBtn);


    const errorMessage = await screen.findByText('adminCreateUser.errorTerms');
    expect(errorMessage).toBeInTheDocument();
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it('handles successful user creation and navigates after delay', async () => {
    vi.useFakeTimers(); 
    axiosInstance.post.mockResolvedValue({ data: { username: 'testadmin' } });

    renderComponent();
    fillRequiredFields();
    
    const termsCheckbox = screen.getByLabelText(/adminCreateUser.labelTerms/i);
    fireEvent.click(termsCheckbox);

    fireEvent.click(screen.getByText('adminCreateUser.btnCreate'));

    const successMsg = await screen.findByText(/adminCreateUser.successMessage/);
    expect(successMsg).toBeInTheDocument();

    vi.advanceTimersByTime(1500);
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
    
    vi.useRealTimers();
  });

  it('shows error message from API on failure', async () => {
    axiosInstance.post.mockRejectedValue({
      response: { data: { error: 'Username already taken' } }
    });

    renderComponent();
    fillRequiredFields();
    
    const termsCheckbox = screen.getByLabelText(/adminCreateUser.labelTerms/i);
    fireEvent.click(termsCheckbox);

    fireEvent.click(screen.getByText('adminCreateUser.btnCreate'));

    const apiError = await screen.findByText('Username already taken');
    expect(apiError).toBeInTheDocument();
  });

  it('navigates back to admin dashboard when clicking back button', () => {
    renderComponent();
    fireEvent.click(screen.getByText('adminCreateUser.btnBack'));
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });
});