import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom'; 
import { AuthContext } from '../../src/context/AuthContext'; 
import BlogCard from '../../src/components/BlogCard';
import axiosConfig from '../../src/api/axiosConfig';


vi.mock('../../src/api/axiosConfig', () => ({
  default: {
    delete: vi.fn().mockResolvedValue({ data: { message: 'Post deleted successfully' } })
  }
}));


const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});


vi.mock('html-react-parser', () => ({
  default: (content) => content || '',
}));


vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }) => {
    const iconName = icon?.iconName || 'unknown';
    return <span data-testid={`icon-${iconName}`} />;
  }
}));

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faTrash: { iconName: 'trash' },
  faEdit: { iconName: 'pen-to-square' },
  faHeart: { iconName: 'heart' }
}));


vi.mock('../../src/styles/Blogcard.module.css', () => ({
  default: {
    card: 'card',
    cardContent: 'cardContent',
    cardTitle: 'cardTitle',
    cardDescription: 'cardDescription',
    tagsContainer: 'tagsContainer',
    tagItem: 'tagItem',
    cardFooter: 'cardFooter',
    postLikes: 'postLikes',
    heart: 'heart',
    iconContainer: 'iconContainer',
    iconButton: 'iconButton',
  }
}));

describe('BlogCard Component', () => {
  const originalConfirm = window.confirm;
  const originalReload = window.location.reload;
  const originalAlert = window.alert;


  const mockAuthValue = {
    user: { id: 1, username: 'testuser' },
    isAdmin: true,
    loading: false
  };


  const renderBlogCard = (blog, authValue = mockAuthValue) => {
    return render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <BlogCard blog={blog} />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  const mockBlog = {
    id: 1,
    title: 'Test Blog',
    content: 'This is a test blog content',
    likes_count: 5,
    tags: ['react', 'javascript'],
  };

  const mockLongBlog = {
    id: 2,
    title: 'Long Blog',
    content: 'A'.repeat(200) + ' long content that should be truncated',
    likes_count: 1,
    tags: ['react'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn().mockReturnValue(true);
    window.location.reload = vi.fn();
    window.alert = vi.fn();
  });

  afterEach(() => {
    window.confirm = originalConfirm;
    window.location.reload = originalReload;
    window.alert = originalAlert;
  });

  it('renders blog information correctly', () => {
    renderBlogCard(mockBlog);
    expect(screen.getByText('Test Blog')).toBeInTheDocument();
    expect(screen.getByText('This is a test blog content')).toBeInTheDocument();
    expect(screen.getByText('5 Likes')).toBeInTheDocument();
  });

  it('navigates to the blog view page when title is clicked', () => {
    renderBlogCard(mockBlog);
    fireEvent.click(screen.getByText('Test Blog'));
    expect(mockNavigate).toHaveBeenCalledWith('/blogs/view/1');
  });

  it('navigates to edit page when edit button is clicked', () => {
    renderBlogCard(mockBlog);
    const editBtn = screen.getByTestId('icon-pen-to-square').closest('button');
    fireEvent.click(editBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/blogs/edit/1');
  });

  it('deletes post after confirm', async () => {
    renderBlogCard(mockBlog);
    const deleteBtn = screen.getByTestId('icon-trash').closest('button');
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(axiosConfig.delete).toHaveBeenCalledWith(`/deletePost/${mockBlog.id}`, { withCredentials: true });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Post deleted successfully.');
    });
  });
});