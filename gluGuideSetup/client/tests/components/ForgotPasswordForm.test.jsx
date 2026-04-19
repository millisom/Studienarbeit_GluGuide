import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import axios from '../../src/api/axiosConfig';
import ForgotPasswordForm from '../../src/components/ForgotPasswordForm';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../src/api/axiosConfig', () => ({
  default: { post: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('ForgotPasswordForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (authValue = { user: null }) =>
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <ForgotPasswordForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('renders the form with email input', () => {
    renderForm();
    expect(screen.getByPlaceholderText('forgotPassword.placeholder')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /forgotPassword\.btnSend/i })).toBeInTheDocument();
  });

  it('redirects logged-in users to /blogs', () => {
    renderForm({ user: { username: 'x' } });
    expect(mockNavigate).toHaveBeenCalledWith('/blogs');
  });

  it('submits the email and shows success message', async () => {
    axios.post.mockResolvedValue({
      data: { message: 'Check your email', success: true },
    });
    renderForm();

    fireEvent.change(screen.getByPlaceholderText('forgotPassword.placeholder'), {
      target: { value: 'user@example.com' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /forgotPassword\.btnSend/i }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/forgotPassword', { email: 'user@example.com' });
      expect(screen.getByText('Check your email')).toBeInTheDocument();
    });
  });

  it('shows server error message on failed request', async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: 'User not found' } },
    });
    renderForm();

    fireEvent.change(screen.getByPlaceholderText('forgotPassword.placeholder'), {
      target: { value: 'nobody@example.com' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /forgotPassword\.btnSend/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('shows fallback error message when no server message available', async () => {
    axios.post.mockRejectedValue({});
    renderForm();

    fireEvent.change(screen.getByPlaceholderText('forgotPassword.placeholder'), {
      target: { value: 'user@example.com' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /forgotPassword\.btnSend/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('forgotPassword.errorFallback')).toBeInTheDocument();
    });
  });
});
