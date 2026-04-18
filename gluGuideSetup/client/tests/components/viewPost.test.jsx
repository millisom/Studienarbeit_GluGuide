import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import axios from '../../src/api/axiosConfig';
import ViewPost from '../../src/components/viewPost';


const stableT = (key) => key;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../src/api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../src/components/CommentsSection', () => ({
  default: () => <div data-testid="mock-comments">Comments</div>,
}));

vi.mock('html-react-parser', () => ({
  default: (content) => content || '',
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('ViewPost Component', () => {
  const basePost = {
    id: 5,
    title: 'Test Post',
    content: '<p>Body</p>',
    username: 'alice',
    user_id: 1,
    likesCount: 2,
    created_at: '2025-05-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderView = (authValue) =>
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/blogs/view/5']}>
          <Routes>
            <Route path="/blogs/view/:id" element={<ViewPost />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('shows loading initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    renderView({ user: { id: 1 }, isAdmin: false, loading: false });
    expect(screen.getByText('viewPost.loading')).toBeInTheDocument();
  });

  it('renders post title after successful fetch', async () => {
    axios.get.mockResolvedValue({ data: basePost });
    renderView({ user: { id: 1 }, isAdmin: false, loading: false });
    expect(await screen.findByText('Test Post')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    axios.get.mockRejectedValue({ message: 'fail' });
    renderView({ user: { id: 1 }, isAdmin: false, loading: false });
    expect(await screen.findByText('viewPost.errorLoad')).toBeInTheDocument();
  });

  it('navigates to login when unauthenticated user clicks like', async () => {
    axios.get.mockResolvedValue({ data: basePost });
    const { container } = renderView({ user: null, isAdmin: false, loading: false });
    await screen.findByText('Test Post');

 
    const likeBtn = container.querySelector('.likeButton');
    fireEvent.click(likeBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('toggles like and updates count for logged-in user', async () => {
    axios.get.mockResolvedValue({ data: basePost });
    axios.post.mockResolvedValue({ data: { likesCount: 3 } });

    const { container } = renderView({ user: { id: 1 }, isAdmin: false, loading: false });
    await screen.findByText('Test Post');

    const likeBtn = container.querySelector('.likeButton');
    fireEvent.click(likeBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/toggleLike/5', {}, { withCredentials: true });
    });
  });

  it('deletes post and navigates away on confirm', async () => {
    axios.get.mockResolvedValue({ data: basePost });
    axios.delete.mockResolvedValue({});

    renderView({ user: { id: 1 }, isAdmin: true, loading: false });
    await screen.findByText('Test Post');


    const deleteBtn = await screen.findByText(/viewPost\.delete/i);
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('/deletePost/5', { withCredentials: true });
      expect(mockNavigate).toHaveBeenCalledWith('/blogs');
    });
  });
});