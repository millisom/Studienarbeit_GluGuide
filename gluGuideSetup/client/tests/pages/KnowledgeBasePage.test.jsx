import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import KnowledgeBasePage from '../../src/pages/KnowledgeBasePage'; // Pfad anpassen
import axiosInstance from '../../src/api/axiosConfig';
import { AuthContext } from '../../src/context/AuthContext';

// --- Mocks ---

const stableT = (key) => key;
const mockNavigate = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../src/api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

const mockArticles = [
  {
    id: 1,
    title_en: 'English Title',
    title_de: 'Deutscher Titel',
    summary_en: 'English Summary',
    summary_de: 'Deutsche Zusammenfassung',
    image_url: 'test.jpg',
    tags: ['Health', 'Diabetes'],
  },
];

describe('KnowledgeBasePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = (isAdmin = false) =>
    render(
      <AuthContext.Provider value={{ isAdmin }}>
        <MemoryRouter>
          <KnowledgeBasePage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('shows loading state initially', () => {
    axiosInstance.get.mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText('knowledge.loading')).toBeInTheDocument();
  });

  it('renders articles in English by default', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockArticles });
    renderPage();

    expect(await screen.findByText('English Title')).toBeInTheDocument();
    expect(screen.getByText('English Summary')).toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
  });

  it('shows admin actions only when user is admin', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockArticles });
    
    // Test als Admin
    const { rerender } = renderPage(true);
    expect(await screen.findByText('postCard.btnEdit')).toBeInTheDocument();
    expect(screen.getByText('postCard.btnDelete')).toBeInTheDocument();

    // Test als normaler User
    rerender(
      <AuthContext.Provider value={{ isAdmin: false }}>
        <MemoryRouter>
          <KnowledgeBasePage />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    expect(screen.queryByText('postCard.btnEdit')).not.toBeInTheDocument();
    expect(screen.getByText('knowledge.readMore')).toBeInTheDocument();
  });

  it('navigates to detail page on article click', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockArticles });
    renderPage();

    const title = await screen.findByText('English Title');
    fireEvent.click(title);

    expect(mockNavigate).toHaveBeenCalledWith('/knowledge/1');
  });

  it('handles article deletion correctly', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    axiosInstance.get.mockResolvedValue({ data: mockArticles });
    axiosInstance.delete.mockResolvedValue({});

    renderPage(true);

    const deleteBtn = await screen.findByText('postCard.btnDelete');
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledWith('/admin/knowledge/1');
      // Nach dem Löschen sollte get erneut aufgerufen werden
      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
    });
  });

  it('shows error message on fetch failure', async () => {
    axiosInstance.get.mockRejectedValue(new Error('API Fail'));
    renderPage();

    expect(await screen.findByText('knowledge.errorFetch')).toBeInTheDocument();
  });
});