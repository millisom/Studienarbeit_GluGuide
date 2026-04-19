import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import axios from '../../src/api/axiosConfig';
import CreatePost from '../../src/components/CreatePost';


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

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('CreatePost Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const renderCreatePost = (authValue = { user: { id: 1, username: 'testuser' }, loading: false }) =>
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <CreatePost />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('shows loading state while auth is loading', () => {
    renderCreatePost({ user: null, loading: true });
    expect(screen.getByText('createPost.loading')).toBeInTheDocument();
  });

  it('shows login prompt when user is not logged in', () => {
    renderCreatePost({ user: null, loading: false });
    

    expect(screen.getByRole('link', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Create an Account/i })).toBeInTheDocument();
  });

  it('renders the form when user is logged in', () => {
    renderCreatePost();
    expect(screen.getByText('createPost.formTitle')).toBeInTheDocument();
    expect(screen.getByText('createPost.labelTitle')).toBeInTheDocument();
    expect(screen.getByText('createPost.labelContent')).toBeInTheDocument();
    expect(screen.getByText('createPost.labelTags')).toBeInTheDocument();
  });

  it('shows error when title or content is empty on submit', async () => {
    const { container } = renderCreatePost();
    const form = container.querySelector('form');
    if (form) form.noValidate = true;

    fireEvent.click(screen.getByRole('button', { name: /createPost\.submitBtn/i }));


    expect(await screen.findByText('createPost.errorEmpty')).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('submits the form and navigates on success', async () => {
    axios.post.mockResolvedValue({ data: { post: { id: 77 } } });
    const { container } = renderCreatePost();

    const titleInput = container.querySelector('input[type="text"]');
    fireEvent.change(titleInput, { target: { value: 'My Post' } });
    fireEvent.change(screen.getByTestId('mock-quill'), { target: { value: 'Hello world' } });

    fireEvent.click(screen.getByRole('button', { name: /createPost\.submitBtn/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/createPost',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        })
      );
    });

    expect(screen.getByText('createPost.successMsg')).toBeInTheDocument();


    vi.advanceTimersByTime(1500);
    expect(mockNavigate).toHaveBeenCalledWith('/blogs/view/77');
  });

  it('shows auth error when server returns 401', async () => {
    axios.post.mockRejectedValue({ response: { status: 401 } });
    const { container } = renderCreatePost();

    const titleInput = container.querySelector('input[type="text"]');
    fireEvent.change(titleInput, { target: { value: 'Post' } });
    fireEvent.change(screen.getByTestId('mock-quill'), { target: { value: 'Content' } });

    fireEvent.click(screen.getByRole('button', { name: /createPost\.submitBtn/i }));

    expect(await screen.findByText('createPost.errorAuth')).toBeInTheDocument();
  });

  it('shows generic error on other failures', async () => {
    axios.post.mockRejectedValue({ message: 'Network error' });
    const { container } = renderCreatePost();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const titleInput = container.querySelector('input[type="text"]');
    fireEvent.change(titleInput, { target: { value: 'Post' } });
    fireEvent.change(screen.getByTestId('mock-quill'), { target: { value: 'Content' } });

    fireEvent.click(screen.getByRole('button', { name: /createPost\.submitBtn/i }));

    expect(await screen.findByText('createPost.errorFailed')).toBeInTheDocument();
  });
});