import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import axios from '../../src/api/axiosConfig';
import ResetPasswordForm from '../../src/components/ResetPasswordForm';

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

describe('ResetPasswordForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  const renderForm = (authValue = { user: null, loading: false }) =>
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/reset/abc123']}>
          <Routes>
            <Route path="/reset/:token" element={<ResetPasswordForm />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('returns null while auth is loading', () => {
    const { container } = renderForm({ user: null, loading: true });
    expect(container).toBeEmptyDOMElement();
    vi.useRealTimers();
  });

  it('redirects logged-in user to /account', () => {
    renderForm({ user: { username: 'x' }, loading: false });
    expect(mockNavigate).toHaveBeenCalledWith('/account');
    vi.useRealTimers();
  });

  it('renders password inputs when not logged in', () => {
    renderForm();
    expect(screen.getByPlaceholderText('resetPassword.placeholderNew')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('resetPassword.placeholderConfirm')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('shows error when passwords do not match', async () => {
    renderForm();

    fireEvent.change(screen.getByPlaceholderText('resetPassword.placeholderNew'), {
      target: { value: 'abcdefgh' },
    });
    fireEvent.change(screen.getByPlaceholderText('resetPassword.placeholderConfirm'), {
      target: { value: 'different' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /resetPassword\.btnReset/i }));
    });

    expect(screen.getByText('resetPassword.errorMismatch')).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('shows error when password is too short', async () => {
    renderForm();

    fireEvent.change(screen.getByPlaceholderText('resetPassword.placeholderNew'), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByPlaceholderText('resetPassword.placeholderConfirm'), {
      target: { value: 'short' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /resetPassword\.btnReset/i }));
    });

    expect(screen.getByText('resetPassword.errorLength')).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('posts token + password and navigates after success', async () => {
    axios.post.mockResolvedValue({ data: { message: 'Password changed' } });
    renderForm();

    fireEvent.change(screen.getByPlaceholderText('resetPassword.placeholderNew'), {
      target: { value: 'newpass12' },
    });
    fireEvent.change(screen.getByPlaceholderText('resetPassword.placeholderConfirm'), {
      target: { value: 'newpass12' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /resetPassword\.btnReset/i }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/resetPassword', {
        token: 'abc123',
        newPassword: 'newpass12',
      });
    });
    expect(screen.getByText('Password changed')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2500);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    vi.useRealTimers();
  });

  it('shows server error message on failure', async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: 'Token expired' } },
    });
    renderForm();

    fireEvent.change(screen.getByPlaceholderText('resetPassword.placeholderNew'), {
      target: { value: 'newpass12' },
    });
    fireEvent.change(screen.getByPlaceholderText('resetPassword.placeholderConfirm'), {
      target: { value: 'newpass12' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /resetPassword\.btnReset/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Token expired')).toBeInTheDocument();
    });
    vi.useRealTimers();
  });
});
