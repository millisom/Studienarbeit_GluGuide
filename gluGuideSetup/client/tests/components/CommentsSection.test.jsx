import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthContext } from '../../src/context/AuthContext';
import axios from '../../src/api/axiosConfig';
import CommentsSection from '../../src/components/CommentsSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../src/api/axiosConfig', () => ({
  default: { get: vi.fn() },
}));

vi.mock('../../src/components/createComment', () => ({
  default: ({ postId, hasExistingComments }) => (
    <div data-testid="mock-create-comment" data-post={postId} data-has={String(hasExistingComments)}>
      CreateComment
    </div>
  ),
}));

vi.mock('../../src/components/fetchComments', () => ({
  default: ({ comments, currentUserId, isAdmin }) => (
    <div data-testid="mock-comments-list" data-count={comments.length} data-user={String(currentUserId)} data-admin={String(isAdmin)}>
      List
    </div>
  ),
}));

describe('CommentsSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderSection = (authValue = { user: { id: 5 }, isAdmin: false }) =>
    render(
      <AuthContext.Provider value={authValue}>
        <CommentsSection postId={42} />
      </AuthContext.Provider>
    );

  it('fetches comments for the given postId on mount', async () => {
    axios.get.mockResolvedValue({ data: { comments: [] } });
    await act(async () => {
      renderSection();
    });
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/comments/42', { withCredentials: true });
    });
  });

  it('passes comments down to CommentsList', async () => {
    axios.get.mockResolvedValue({
      data: { comments: [{ id: 1 }, { id: 2 }, { id: 3 }] },
    });
    await act(async () => {
      renderSection();
    });
    await waitFor(() => {
      expect(screen.getByTestId('mock-comments-list').getAttribute('data-count')).toBe('3');
    });
  });

  it('passes hasExistingComments=true when comments exist', async () => {
    axios.get.mockResolvedValue({ data: { comments: [{ id: 1 }] } });
    await act(async () => {
      renderSection();
    });
    await waitFor(() => {
      expect(screen.getByTestId('mock-create-comment').getAttribute('data-has')).toBe('true');
    });
  });

  it('passes currentUserId and isAdmin props correctly', async () => {
    axios.get.mockResolvedValue({ data: { comments: [] } });
    await act(async () => {
      renderSection({ user: { id: 7 }, isAdmin: true });
    });
    await waitFor(() => {
      const el = screen.getByTestId('mock-comments-list');
      expect(el.getAttribute('data-user')).toBe('7');
      expect(el.getAttribute('data-admin')).toBe('true');
    });
  });

  it('shows error message when fetch fails', async () => {
    axios.get.mockRejectedValue(new Error('boom'));
    await act(async () => {
      renderSection();
    });
    await waitFor(() => {
      expect(screen.getByText('commentsSection.errorLoad')).toBeInTheDocument();
    });
  });

  it('sets currentUserId to null when user is not logged in', async () => {
    axios.get.mockResolvedValue({ data: { comments: [] } });
    await act(async () => {
      renderSection({ user: null, isAdmin: false });
    });
    await waitFor(() => {
      expect(screen.getByTestId('mock-comments-list').getAttribute('data-user')).toBe('null');
    });
  });
});
