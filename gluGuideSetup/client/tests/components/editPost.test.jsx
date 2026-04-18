import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import axios from '../../src/api/axiosConfig';
import EditPost from '../../src/components/editPost';


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
    put: vi.fn(),
    post: vi.fn(),
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

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('EditPost Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderEdit = (authValue = { user: { id: 1 } }) =>
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/edit/5']}>
          <Routes>
            <Route path="/edit/:id" element={<EditPost />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('loads post data on mount and fills form', async () => {
    axios.get.mockResolvedValue({
      data: {
        title: 'My Title',
        content: 'Some content',
        tags: ['tag1', 'tag2'],
        post_picture: null,
      },
    });

    renderEdit();


    expect(await screen.findByDisplayValue('My Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('tag1, tag2')).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith('/getPost/5', { withCredentials: true });
  });

  it('shows error when load fails', async () => {
    axios.get.mockRejectedValue({ message: 'fail' });
    
    renderEdit();

    expect(await screen.findByText('editPost.errorLoad')).toBeInTheDocument();
  });

  it('saves post and navigates on success', async () => {
    axios.get.mockResolvedValue({
      data: { title: 'Hello', content: '<p>Body</p>', tags: [], post_picture: null },
    });
    axios.put.mockResolvedValue({});

    renderEdit();


    const titleInput = await screen.findByDisplayValue('Hello');
    
    const saveBtn = screen.getByText('editPost.btnSave');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        '/updatePost/5',
        expect.objectContaining({ title: 'Hello' }),
        { withCredentials: true }
      );
      expect(mockNavigate).toHaveBeenCalledWith('/blogs/view/5');
    });
  });

  it('shows save error message when update fails', async () => {
    axios.get.mockResolvedValue({
      data: { title: 'Hello', content: 'body', tags: [], post_picture: null },
    });
    axios.put.mockRejectedValue({ message: 'boom' });

    renderEdit();
    

    await screen.findByDisplayValue('Hello');

    fireEvent.click(screen.getByText('editPost.btnSave'));

    expect(await screen.findByText('editPost.errorSave')).toBeInTheDocument();
  });
});