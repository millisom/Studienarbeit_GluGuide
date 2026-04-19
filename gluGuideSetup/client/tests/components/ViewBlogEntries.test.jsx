import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ViewBlogEntries from '../../src/components/ViewBlogEntries';
import { useBlogPosts } from '../../src/hooks/useBlogPosts';
import { useAuth } from '../../src/context/AuthContext';
import axiosInstance from '../../src/api/axiosConfig';



const stableT = (key) => key;
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
    i18n: { language: 'de' }
  })
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../src/api/axiosConfig', () => ({
  default: {
    delete: vi.fn(),
  }
}));


vi.mock('../../src/hooks/useBlogPosts');
vi.mock('../../src/context/AuthContext');


vi.mock('../../src/components/TagFilter', () => ({
  default: () => <div data-testid="mock-tag-filter" />
}));

vi.mock('../../src/components/PostCard', () => ({
  default: ({ post, handleAdminDelete, handleViewClick }) => (
    <div data-testid={`post-card-${post.id}`}>
      <span>{post.title}</span>
      <button onClick={() => handleViewClick(post.id)}>View</button>
      <button onClick={() => handleAdminDelete(post.id)}>Delete</button>
    </div>
  )
}));

describe('ViewBlogEntries Component', () => {
  const mockRefresh = vi.fn();
  const mockSetSearch = vi.fn();
  
  const defaultHookValue = {
    posts: [
      { id: 1, title: 'First Post' },
      { id: 2, title: 'Second Post' }
    ],
    loading: false,
    error: null,
    searchTerm: '',
    setSearchTerm: mockSetSearch,
    selectedTags: [],
    setSelectedTags: vi.fn(),
    availableTags: [],
    refreshPosts: mockRefresh
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ isAdmin: false });
    useBlogPosts.mockReturnValue(defaultHookValue);
  });

  it('shows loading message', () => {
    useBlogPosts.mockReturnValue({ ...defaultHookValue, loading: true });
    render(<ViewBlogEntries />);
    expect(screen.getByText('viewBlogEntries.loading')).toBeInTheDocument();
  });

  it('renders posts correctly', () => {
    render(<ViewBlogEntries />);
    expect(screen.getByText('viewBlogEntries.title')).toBeInTheDocument();
    expect(screen.getByTestId('post-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-card-2')).toBeInTheDocument();
  });

  it('shows "no posts" message when list is empty', () => {
    useBlogPosts.mockReturnValue({ ...defaultHookValue, posts: [] });
    render(<ViewBlogEntries />);
    expect(screen.getByText('viewBlogEntries.noPosts')).toBeInTheDocument();
  });

  it('updates search term on input change', () => {
    render(<ViewBlogEntries />);
    const input = screen.getByPlaceholderText('viewBlogEntries.searchPlaceholder');
    fireEvent.change(input, { target: { value: 'test search' } });
    expect(mockSetSearch).toHaveBeenCalledWith('test search');
  });

  it('navigates to post detail when clicking view', () => {
    render(<ViewBlogEntries />);
    const viewBtn = screen.getAllByText('View')[0];
    fireEvent.click(viewBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/blogs/view/1');
  });

  it('handles admin deletion successfully', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    axiosInstance.delete.mockResolvedValue({});
    useAuth.mockReturnValue({ isAdmin: true });
    
    render(<ViewBlogEntries />);
    const deleteBtn = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalledWith('viewBlogEntries.confirmDelete');
    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledWith('/deletePost/1', { withCredentials: true });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('shows error if deletion fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    axiosInstance.delete.mockRejectedValue(new Error('Delete fail'));
    useAuth.mockReturnValue({ isAdmin: true });

    render(<ViewBlogEntries />);
    const deleteBtn = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('viewBlogEntries.deleteError');
    });
  });

  it('shows error message if hook returns error', () => {
    useBlogPosts.mockReturnValue({ ...defaultHookValue, error: 'Custom Error' });
    render(<ViewBlogEntries />);
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });
});