import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminEditKnowledge from '../../src/pages/AdminEditKnowledge';
import axiosInstance from '../../src/api/axiosConfig';


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
  },
}));


const tStable = (key) => key;
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: tStable,
  }),
}));


vi.mock('../../src/components/AdminKnowledgeForm', () => ({
  default: ({ initialData, onSubmit, isLoading }) => (
    <div data-testid="mock-knowledge-form">
      <p>Initial Title: {initialData?.title_de}</p>
      <button 
        onClick={() => onSubmit({ title_de: 'Updated Title' })}
        disabled={isLoading}
      >
        Submit Update
      </button>
      {isLoading && <span>Saving...</span>}
    </div>
  ),
}));

describe('AdminEditKnowledge Component', () => {
  const mockArticle = {
    id: '123',
    title_de: 'Test Artikel',
    title_en: 'Test Article',
    content_de: 'Inhalt',
    content_en: 'Content'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });


  const renderWithParams = (id = '123') => {
    return render(
      <MemoryRouter initialEntries={[`/admin/editKnowledge/${id}`]}>
        <Routes>
          <Route path="/admin/editKnowledge/:id" element={<AdminEditKnowledge />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('shows loading state and then the form with data', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockArticle });

    renderWithParams();


    expect(screen.getByText('adminEditPost.loading')).toBeInTheDocument();


    expect(await screen.findByText(/Initial Title: Test Artikel/i)).toBeInTheDocument();
    expect(axiosInstance.get).toHaveBeenCalledWith('/admin/knowledge/123', expect.any(Object));
  });

  it('handles successful update and navigates back to admin', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockArticle });
    axiosInstance.put.mockResolvedValue({ status: 200 });

    renderWithParams();


    const submitBtn = await screen.findByText('Submit Update');
    fireEvent.click(submitBtn);

    await waitFor(() => {

      expect(axiosInstance.put).toHaveBeenCalledWith(
        '/admin/knowledge/123',
        { title_de: 'Updated Title' },
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      );

      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('shows error message if loading fails', async () => {
    axiosInstance.get.mockRejectedValue(new Error('Load Error'));

    renderWithParams();

    const errorMsg = await screen.findByText('adminEditKnowledge.errorLoad');
    expect(errorMsg).toBeInTheDocument();
  });

  it('shows error message if update fails', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockArticle });
    axiosInstance.put.mockRejectedValue(new Error('Update Error'));

    renderWithParams();

    const submitBtn = await screen.findByText('Submit Update');
    fireEvent.click(submitBtn);

    const errorMsg = await screen.findByText('adminEditPost.errorSave');
    expect(errorMsg).toBeInTheDocument();
  });

  it('indicates loading state while updating', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockArticle });

    axiosInstance.put.mockReturnValue(new Promise(() => {}));

    renderWithParams();

    const submitBtn = await screen.findByText('Submit Update');
    fireEvent.click(submitBtn);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });
});