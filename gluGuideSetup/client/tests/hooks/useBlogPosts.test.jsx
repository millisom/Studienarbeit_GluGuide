import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from '../../src/api/axiosConfig';
import { useBlogPosts } from '../../src/hooks/useBlogPosts';

vi.mock('../../src/api/axiosConfig');

describe('useBlogPosts Custom Hook', () => {
  const mockPosts = [
    { id: 1, title: 'Alpha Post', username: 'userA', tags: ['tech'] },
    { id: 2, title: 'Beta Post', username: 'userB', tags: ['life'] }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockPosts });
  });

  it('lädt Daten initial', async () => {
    const { result } = renderHook(() => useBlogPosts());

    expect(result.current.loading).toBe(true);
    expect(result.current.posts).toEqual([]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.posts).toHaveLength(2);
    expect(result.current.posts[0].title).toBe('Alpha Post');
  });

  it('filtert nach Suchbegriff', async () => {
    const { result } = renderHook(() => useBlogPosts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSearchTerm('Beta');
    });

    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0].title).toBe('Beta Post');
  });
});