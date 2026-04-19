import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import axios from '../../src/api/axiosConfig';
import MyBlogs from '../../src/pages/myBlogs';


const stableT = (key) => key;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../src/api/axiosConfig', () => ({
  default: { get: vi.fn() },
}));

vi.mock('../../src/components/BlogCard', () => ({
  default: ({ blog }) => <div data-testid={`blog-${blog.id}`}>{blog.title}</div>,
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('MyBlogs Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <MyBlogs />
      </MemoryRouter>
    );

  it('shows loading initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText('myBlogs.loading')).toBeInTheDocument();
  });

  it('shows error when fetch fails', async () => {
    axios.get.mockRejectedValue(new Error('fail'));
    renderPage();

    expect(await screen.findByText('myBlogs.error')).toBeInTheDocument();
  });

  it('renders blog cards when loaded', async () => {
    axios.get.mockResolvedValue({
      data: [
        { id: 1, title: 'Post One' },
        { id: 2, title: 'Post Two' },
      ],
    });

    renderPage();


    expect(await screen.findByTestId('blog-1')).toBeInTheDocument();
    expect(screen.getByTestId('blog-2')).toBeInTheDocument();
  });

  it('shows empty state when no posts exist', async () => {
    axios.get.mockResolvedValue({ data: [] });
    renderPage();

    expect(await screen.findByText('myBlogs.emptyTitle')).toBeInTheDocument();
    expect(screen.getByText('myBlogs.emptyDescription')).toBeInTheDocument();
  });

  it('navigates to create post when button is clicked', async () => {
    axios.get.mockResolvedValue({ data: [] });
    renderPage();

    const createBtn = await screen.findByText('myBlogs.btnCreate');
    fireEvent.click(createBtn);
    
    expect(mockNavigate).toHaveBeenCalledWith('/create/post');
  });
});