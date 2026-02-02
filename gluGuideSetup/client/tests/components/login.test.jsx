import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/context/AuthContext';
import axios from '../../src/api/axiosConfig';
import Login from '../../src/components/LoginForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('renders the login form', async () => {
    renderLogin();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });
  });

  it('handles form submission and navigates on success', async () => {
    axios.post.mockResolvedValue({ data: { Login: true } });
    
    axios.get.mockResolvedValue({ 
      data: { valid: true, username: 'hossaynew', is_admin: false } 
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'hossaynew' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: '1995' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/login', { username: 'hossaynew', password: '1995' });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/account');
    });
  });

  it('displays error message on failed login', async () => {
    axios.post.mockResolvedValue({ data: { Login: true } });
    axios.get.mockResolvedValue({ data: { valid: false } });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));


    const errorMessage = await screen.findByText(/Session could not be validated/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it('displays generic error message on request failure', async () => {
    axios.post.mockRejectedValue({ 
      response: { data: { message: 'Login failed' } } 
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'hossaynew' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: '1995' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    const genericError = await screen.findByText(/Login failed/i);
    expect(genericError).toBeInTheDocument();
  });
});