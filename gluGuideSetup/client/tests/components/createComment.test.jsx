import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import axios from '../../src/api/axiosConfig';
import CreateComment from '../../src/components/createComment';


const stableT = (key) => key;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
    i18n: { language: 'en' },
  }),
  Trans: ({ children }) => children,
}));

vi.mock('../../src/api/axiosConfig', () => ({
  default: { post: vi.fn() },
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

describe('CreateComment Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderComment = (authValue, props = {}) =>
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <CreateComment postId={1} onCommentCreated={vi.fn()} {...props} />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('shows loading message while auth is loading', () => {
    renderComment({ user: null, loading: true });
    expect(screen.getByText('createComment.loading')).toBeInTheDocument();
  });

  it('shows login prompt for discussion when there are existing comments', () => {
    renderComment({ user: null, loading: false }, { hasExistingComments: true });
    

    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/discussion/i)).toBeInTheDocument();
  });

  it('shows "be the first" prompt when no existing comments', () => {
    renderComment({ user: null, loading: false }, { hasExistingComments: false });
    

    expect(screen.getByRole('link', { name: /create an account/i })).toBeInTheDocument();
    expect(screen.getByText(/first one/i)).toBeInTheDocument();
  });

  it('renders the comment form for logged-in users', () => {
    renderComment({ user: { id: 1 }, loading: false });
    expect(screen.getByText('createComment.title')).toBeInTheDocument();
    expect(screen.getByTestId('mock-quill')).toBeInTheDocument();
  });

  it('shows error when submitting empty content', async () => {
    renderComment({ user: { id: 1 }, loading: false });

    fireEvent.click(screen.getByRole('button', { name: /createComment\.submitBtn/i }));

  
    expect(await screen.findByText('createComment.errorEmpty')).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('submits the comment and calls onCommentCreated on success', async () => {
    axios.post.mockResolvedValue({ data: {} });
    const onCommentCreated = vi.fn();
    renderComment({ user: { id: 1 }, loading: false }, { onCommentCreated });

    fireEvent.change(screen.getByTestId('mock-quill'), {
      target: { value: 'Great post!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /createComment\.submitBtn/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/comments',
        { post_id: 1, content: 'Great post!' },
        { withCredentials: true }
      );
      expect(onCommentCreated).toHaveBeenCalled();
    });
    
    expect(screen.getByText('createComment.successMsg')).toBeInTheDocument();
  });

  it('shows error message on failed submission', async () => {
    axios.post.mockRejectedValue(new Error('fail'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderComment({ user: { id: 1 }, loading: false });

    fireEvent.change(screen.getByTestId('mock-quill'), {
      target: { value: 'Some comment' },
    });

    fireEvent.click(screen.getByRole('button', { name: /createComment\.submitBtn/i }));

    expect(await screen.findByText('createComment.errorFailed')).toBeInTheDocument();
  });
});