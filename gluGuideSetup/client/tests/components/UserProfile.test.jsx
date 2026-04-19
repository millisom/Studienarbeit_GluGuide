import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import axios from '../../src/api/axiosConfig';
import UserProfile from '../../src/components/UserProfile';


const stableT = (key, opts) => (opts ? `${key}:${JSON.stringify(opts)}` : key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../src/api/axiosConfig', () => ({
  default: { get: vi.fn() },
}));

vi.mock('html-react-parser', () => ({
  default: (content) => content || '',
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('UserProfile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderProfile = (authValue = { user: { username: 'alice' } }) =>
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/profile/alice']}>
          <Routes>
            <Route path="/profile/:username" element={<UserProfile />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('shows loading message initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    renderProfile();
    expect(screen.getByText('userProfile.loading')).toBeInTheDocument();
  });

  it('shows error when fetch fails', async () => {
    axios.get.mockRejectedValue(new Error('fail'));
    renderProfile();
    
    expect(await screen.findByText('userProfile.errorLoad')).toBeInTheDocument();
  });

  it('renders username and posts when loaded', async () => {
    axios.get.mockResolvedValue({
      data: {
        user: { username: 'alice', profile_picture: null, profile_bio: 'Hi!' },
        posts: [
          { id: 1, title: 'Post One', created_at: '2025-05-01' },
          { id: 2, title: 'Post Two', created_at: '2025-05-02' },
        ],
      },
    });

    renderProfile();

    expect(await screen.findByText('alice')).toBeInTheDocument();
    expect(screen.getByText('Post One')).toBeInTheDocument();
    expect(screen.getByText('Post Two')).toBeInTheDocument();
  });

  it('shows edit button when viewing own profile', async () => {
    axios.get.mockResolvedValue({
      data: { user: { username: 'alice' }, posts: [] },
    });
    
    renderProfile({ user: { username: 'alice' } });
    
    expect(await screen.findByText('userProfile.btnEdit')).toBeInTheDocument();
  });

  it('hides edit button when viewing someone elses profile', async () => {
    axios.get.mockResolvedValue({
      data: { user: { username: 'alice' }, posts: [] },
    });

    renderProfile({ user: { username: 'bob' } });
    

    await screen.findByText('alice');
    expect(screen.queryByText('userProfile.btnEdit')).not.toBeInTheDocument();
  });

  it('navigates to post detail on post click', async () => {
    axios.get.mockResolvedValue({
      data: {
        user: { username: 'alice' },
        posts: [{ id: 7, title: 'Clickable', created_at: '2025-01-01' }],
      },
    });

    renderProfile();
    
    const post = await screen.findByText('Clickable');
    fireEvent.click(post);
    
    expect(mockNavigate).toHaveBeenCalledWith('/blogs/view/7');
  });

  it('shows "no posts" message when posts array is empty', async () => {
    axios.get.mockResolvedValue({
      data: { user: { username: 'alice' }, posts: [] },
    });

    renderProfile();
    
    expect(await screen.findByText('userProfile.noPosts')).toBeInTheDocument();
  });

  it('navigates to /account when edit button clicked', async () => {
    axios.get.mockResolvedValue({
      data: { user: { username: 'alice' }, posts: [] },
    });

    renderProfile({ user: { username: 'alice' } });
    
    const editBtn = await screen.findByText('userProfile.btnEdit');
    fireEvent.click(editBtn);
    
    expect(mockNavigate).toHaveBeenCalledWith('/account');
  });
});