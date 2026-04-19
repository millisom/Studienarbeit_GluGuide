import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import axios from '../../src/api/axiosConfig';
import CommentsList from '../../src/components/fetchComments';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, opts) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
    i18n: { language: 'en' },
  }),
  Trans: ({ children }) => children,
}));

vi.mock('../../src/api/axiosConfig', () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock('react-quill', () => ({
  default: ({ value, onChange }) => (
    <textarea
      data-testid="mock-quill"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
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

describe('CommentsList Component', () => {
  const comments = [
    { id: 1, username: 'alice', content: 'Hello', likes: [2], dislikes: [], user_id: 10 },
    { id: 2, username: 'bob', content: 'World', likes: [], dislikes: [1], user_id: 20 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderList = (authValue, props = {}) =>
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <CommentsList
            comments={comments}
            currentUserId={10}
            isAdmin={false}
            refreshComments={vi.fn()}
            {...props}
          />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('shows loading while auth is loading', () => {
    renderList({ user: null, loading: true });
    expect(screen.getByText('commentsList.loading')).toBeInTheDocument();
  });

  it('shows "no comments" message for logged-in users with empty list', () => {
    render(
      <AuthContext.Provider value={{ user: { id: 1 }, loading: false }}>
        <MemoryRouter>
          <CommentsList
            comments={[]}
            currentUserId={1}
            isAdmin={false}
            refreshComments={vi.fn()}
          />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByText('commentsList.noComments')).toBeInTheDocument();
  });

  it('returns null when no comments and user is logged out', () => {
    const { container } = render(
      <AuthContext.Provider value={{ user: null, loading: false }}>
        <MemoryRouter>
          <CommentsList
            comments={[]}
            currentUserId={null}
            isAdmin={false}
            refreshComments={vi.fn()}
          />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders all comments with authors', () => {
    renderList({ user: { id: 10 }, loading: false });
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
  });

  it('navigates to author profile when username button is clicked', () => {
    renderList({ user: { id: 10 }, loading: false });
    fireEvent.click(screen.getByText('alice'));
    expect(mockNavigate).toHaveBeenCalledWith('/profile/alice');
  });

  it('calls like endpoint and refreshComments on like click', async () => {
    const refreshComments = vi.fn();
    axios.post.mockResolvedValue({});
    renderList({ user: { id: 10 }, loading: false }, { refreshComments });

    // The first thumbs up button triggers handleLike for comment id=1
    const buttons = screen.getAllByRole('button');
    // Click a like button — heuristic: find one with icon testid
    const likeButtons = buttons.filter((b) => b.querySelector('[data-testid="icon"]'));
    await act(async () => {
      fireEvent.click(likeButtons[0]);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(refreshComments).toHaveBeenCalled();
    });
  });
});
