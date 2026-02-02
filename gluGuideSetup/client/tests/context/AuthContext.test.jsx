import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import axios from '../../src/api/axiosConfig';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../src/api/axiosConfig');

describe('AuthContext Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAuthHook = () => {
    return renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });
  };

  it('prüft beim Start den Login-Status (Initial Check)', async () => {
    axios.get.mockResolvedValue({ 
      data: { valid: true, username: 'TestUser', is_admin: true } 
    });

    const { result } = renderAuthHook();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user.username).toBe('TestUser');
    expect(result.current.isAdmin).toBe(true);
  });

  it('führt Login erfolgreich durch', async () => {

    axios.post.mockResolvedValue({ data: { Login: true } });
    axios.get.mockResolvedValue({ 
      data: { valid: true, username: 'NewUser', is_admin: false } 
    });

    const { result } = renderAuthHook();

    await act(async () => {
      await result.current.login({ username: 'NewUser', password: '123' });
    });

    expect(axios.post).toHaveBeenCalledWith('/login', { username: 'NewUser', password: '123' });
    expect(result.current.user.username).toBe('NewUser');
  });
});