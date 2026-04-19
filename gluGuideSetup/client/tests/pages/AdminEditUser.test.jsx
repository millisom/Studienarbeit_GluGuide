import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminEditUser from '../../src/pages/AdminEditUser';



vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="fa-icon" />
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-quill', () => ({
  default: ({ value, onChange }) => (
    <textarea
      data-testid="quill-mock"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

const tStable = (key, params) => {
  if (params?.message) return `${key} ${params.message}`;
  return key;
};
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: tStable,
  }),
}));

global.fetch = vi.fn();

describe('AdminEditUser Component', () => {
  const mockUserData = {
    username: 'john_doe',
    email: 'john@example.com',
    is_admin: true,
    profile_bio: '<p>Hello world</p>'
  };

  const mockAvatarData = { url: 'http://localhost:8080/uploads/avatar.png' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(console, 'error').mockImplementation(() => {});


    fetch.mockImplementation((url) => {
      if (url.includes('/avatar')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAvatarData),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData),
      });
    });
  });

  const renderWithParams = (id = '123') => {
    return render(
      <MemoryRouter initialEntries={[`/admin/editUser/${id}`]}>
        <Routes>
          <Route path="/admin/editUser/:id" element={<AdminEditUser />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('shows loading state and then fetches and displays user data', async () => {
    renderWithParams();

    expect(screen.getByText('adminEditUser.loading')).toBeInTheDocument();


    const usernameInput = await screen.findByDisplayValue('john_doe');
    expect(usernameInput).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByAltText('User avatar')).toHaveAttribute('src', mockAvatarData.url);
  });

  it('handles successful form submission and navigates after delay', async () => {
    vi.useFakeTimers();
    

    fetch.mockImplementation((url, options) => {
      if (options?.method === 'PUT') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
      }
      if (url.includes('/avatar')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockAvatarData) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUserData) });
    });

    renderWithParams();
    

    await screen.findByDisplayValue('john_doe');

    const submitBtn = screen.getByText('adminEditUser.btnUpdate');
    fireEvent.click(submitBtn);


    const successMsg = await screen.findByText('adminEditUser.successUpdate');
    expect(successMsg).toBeInTheDocument();


    vi.advanceTimersByTime(1500);
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
    
    vi.useRealTimers();
  });

  it('handles avatar removal', async () => {

    fetch.mockImplementation((url, options) => {
      if (options?.method === 'DELETE') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Deleted' }) });
      }
      if (url.includes('/avatar')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockAvatarData) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUserData) });
    });

    renderWithParams();
    

    const avatarImg = await screen.findByAltText('User avatar');
    expect(avatarImg).toBeInTheDocument();

    const removeBtn = screen.getByText('adminEditUser.btnRemoveAvatar');
    fireEvent.click(removeBtn);

    expect(window.confirm).toHaveBeenCalledWith('adminEditUser.confirmRemoveAvatar');
    

    await waitFor(() => {
      expect(screen.getByText('adminEditUser.successRemoveAvatar')).toBeInTheDocument();
      expect(screen.queryByAltText('User avatar')).not.toBeInTheDocument();
    });
  });

  it('shows error message if user data fetch fails', async () => {
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false }));

    renderWithParams();

    const errorMsg = await screen.findByText('adminEditUser.errorFetch');
    expect(errorMsg).toBeInTheDocument();
  });

  it('navigates back to admin page on back button click', async () => {
    renderWithParams();
    await screen.findByDisplayValue('john_doe');

    const backBtn = screen.getByText('adminEditUser.btnBack');
    fireEvent.click(backBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });

  it('shows error if update fails', async () => {
    fetch.mockImplementation((url, options) => {
      if (options?.method === 'PUT') {
        return Promise.resolve({ 
          ok: false, 
          json: () => Promise.resolve({ error: 'Server Error' }) 
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUserData) });
    });

    renderWithParams();
    await screen.findByDisplayValue('john_doe');

    const submitBtn = screen.getByText('adminEditUser.btnUpdate');
    fireEvent.click(submitBtn);

    const errorMsg = await screen.findByText(/adminEditUser.errorUpdate/i);
    expect(errorMsg).toBeInTheDocument();
  });
});