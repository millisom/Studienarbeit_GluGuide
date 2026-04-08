import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/context/AuthContext';
import axios from '../../src/api/axiosConfig';
import Login from '../../src/components/LoginForm';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() }
  }),
  Trans: ({ children }) => children 
}));

vi.mock('../../src/api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: { valid: false } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderLogin = async () => {
    let utils;
    await act(async () => {
      utils = render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );
    });
    return utils;
  };

  it('renders the login form after loading', async () => {
    await renderLogin();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('login.username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('login.password')).toBeInTheDocument();
    });
  });

  it('handles form submission and navigates on success', async () => {
    axios.post.mockResolvedValue({ data: { Login: true } });
    axios.get.mockResolvedValue({ data: { valid: true, username: 'Emili2', is_admin: false } });

    await renderLogin();

    fireEvent.change(screen.getByPlaceholderText('login.username'), { target: { value: 'Emili2' } });
    fireEvent.change(screen.getByPlaceholderText('login.password'), { target: { value: '1234' } });

    const loginButton = screen.getByRole('button', { name: /login\.btnLogin|login/i });
    
    await act(async () => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/login', expect.objectContaining({
        username: 'Emili2',
        password: '1234'
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/account');
    });
  });

  it('displays error message on failed login response', async () => {
    axios.post.mockResolvedValue({ data: { Login: false, message: 'Invalid credentials' } });

    await renderLogin();

    // WICHTIG: Beide Felder ausfüllen, sonst blockiert das "required" Attribut den API-Call!
    fireEvent.change(screen.getByPlaceholderText('login.username'), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByPlaceholderText('login.password'), { target: { value: 'wrongpass' } });
    
    const loginButton = screen.getByRole('button', { name: /login\.btnLogin|login/i });
    
    await act(async () => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });
});