import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import axios from '../../src/api/axiosConfig';


vi.mock('../../src/api/axiosConfig');

describe('AuthContext Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAuthHook = () => {
    return renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
    });
  };

  it('prüft beim Start den Login-Status (Initial Check)', async () => {

    axios.get.mockResolvedValueOnce({ 
      data: { loggedIn: true, user: { id: 1, username: 'TestUser', is_admin: true } } 
    });

    const { result } = renderAuthHook();

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user.username).toBe('TestUser');
    expect(result.current.isAdmin).toBe(true);
  });

  it('führt Login erfolgreich durch', async () => {

    axios.get.mockRejectedValueOnce(new Error('Not logged in'));
    

    axios.post.mockResolvedValueOnce({ 
      data: { success: true, user: { id: 2, username: 'NewUser' } } 
    });

    const { result } = renderAuthHook();
    await waitFor(() => expect(result.current.loading).toBe(false));


    await act(async () => {
      await result.current.login({ username: 'NewUser', password: '123' });
    });

    expect(axios.post).toHaveBeenCalledWith('/login', { username: 'NewUser', password: '123' });
    expect(result.current.user.username).toBe('NewUser');
  });

  it('führt Logout erfolgreich durch', async () => {

    axios.get.mockResolvedValueOnce({ 
        data: { loggedIn: true, user: { id: 1 } } 
    });

    axios.post.mockResolvedValueOnce({ success: true });

    const { result } = renderAuthHook();
    await waitFor(() => expect(result.current.user).not.toBeNull());


    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAdmin).toBe(false);
  });
});