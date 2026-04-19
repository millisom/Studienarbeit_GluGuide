import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminEditPost from '../../src/pages/AdminEditPost';
import axiosInstance from '../../src/api/axiosConfig';



vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="fa-icon" />
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../src/api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('react-quill', () => ({
  default: ({ value, onChange }) => (
    <textarea
      data-testid="quill-mock"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

const tStable = (key) => key;
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: tStable,
  }),
}));

describe('AdminEditPost Component', () => {
  const mockPostData = {
    title: 'Mein Blogpost',
    content: '<p>Inhalt</p>',
    tags: ['Diabetes', 'News'],
    post_picture: 'bild.jpg'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  const renderWithParams = (id = '42') => {
    return render(
      <MemoryRouter initialEntries={[`/admin/editPost/${id}`]}>
        <Routes>
          <Route path="/admin/editPost/:id" element={<AdminEditPost />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('fetches post data and populates the form', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockPostData });
    renderWithParams();

    const titleInput = await screen.findByDisplayValue('Mein Blogpost');
    expect(titleInput).toBeInTheDocument();
    expect(screen.getByTestId('quill-mock')).toHaveValue('<p>Inhalt</p>');
    expect(screen.getByDisplayValue('Diabetes, News')).toBeInTheDocument();
  });

  it('handles post saving and navigation', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockPostData });
    axiosInstance.put.mockResolvedValue({ status: 200 });

    renderWithParams();

    const titleInput = await screen.findByDisplayValue('Mein Blogpost');
    fireEvent.change(titleInput, { target: { value: 'Neuer Titel' } });

    const saveBtn = screen.getByRole('button', { name: /adminEditPost\.btnSave/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith(
        '/admin/posts/42',
        expect.objectContaining({ title: 'Neuer Titel' }),
        expect.any(Object)
      );
      expect(mockNavigate).toHaveBeenCalledWith('/blogs/view/42');
    });
  });

  it('handles image upload correctly', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockPostData });
    axiosInstance.post.mockResolvedValue({ data: { imageUrl: 'new-image.jpg' } });

    const { container } = renderWithParams();


    await screen.findByDisplayValue('Mein Blogpost');


    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]');
    
    fireEvent.change(fileInput, { target: { files: [file] } });

  
    const uploadBtn = screen.getByText('adminEditPost.btnUpload');
    fireEvent.click(uploadBtn);

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/uploadPostImage/42',
        expect.any(FormData),
        expect.any(Object)
      );
    });
  });

  it('shows an alert if upload is clicked without selecting an image', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockPostData });
    renderWithParams();

    const uploadBtn = await screen.findByText('adminEditPost.btnUpload');
    fireEvent.click(uploadBtn);

    expect(window.alert).toHaveBeenCalledWith('adminEditPost.alertSelectImage');
  });

  it('handles image deletion', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockPostData });
    axiosInstance.delete.mockResolvedValue({ status: 200 });

    renderWithParams();

    const deleteBtn = await screen.findByText('adminEditPost.btnRemoveImage');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledWith('/deletePostImage/42', expect.any(Object));
    });
  });

  it('navigates back on cancel', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockPostData });
    renderWithParams();

    const cancelBtn = await screen.findByText('adminEditPost.btnCancel');
    fireEvent.click(cancelBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/blogs/view/42');
  });

  it('shows error message if post loading fails', async () => {
    axiosInstance.get.mockRejectedValue(new Error('API Error'));
    renderWithParams();

    const errorMsg = await screen.findByText('adminEditPost.errorLoad');
    expect(errorMsg).toBeInTheDocument();
  });
});