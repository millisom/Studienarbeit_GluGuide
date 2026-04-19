import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import Logout from '../../src/components/logout';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('Logout Component', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderLogout = () =>
    render(
      <AuthContext.Provider value={{ logout: mockLogout }}>
        <MemoryRouter>
          <Logout />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('renders a button with logout label', () => {
    renderLogout();
    expect(screen.getByRole('button')).toHaveTextContent('logout.button');
  });

  it('calls logout, alerts success, and navigates to home on success', async () => {
    mockLogout.mockResolvedValue();
    renderLogout();

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('logout.success');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('alerts error and does not navigate on failure', async () => {
    mockLogout.mockRejectedValue(new Error('boom'));
    renderLogout();

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('logout.error');
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
