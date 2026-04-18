import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from '../../src/api/axiosConfig';
import ArticleView from '../../src/pages/ArticleView';

// 1. STABILE t-Funktion außerhalb definieren
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

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('ArticleView Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/knowledge/5']}>
        <Routes>
          <Route path="/knowledge/:id" element={<ArticleView />} />
        </Routes>
      </MemoryRouter>
    );

  it('shows loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText('knowledge.loading')).toBeInTheDocument();
  });

  it('shows error when fetch fails', async () => {
    axios.get.mockRejectedValue(new Error('fail'));
    renderPage();
    
    // findByText wartet automatisch asynchron
    expect(await screen.findByText('knowledge.errorLoad')).toBeInTheDocument();
  });

  it('shows "not found" when response is empty', async () => {
    axios.get.mockResolvedValue({ data: null });
    renderPage();
    
    expect(await screen.findByText('knowledge.notFound')).toBeInTheDocument();
  });

  it('renders article content when loaded', async () => {
    axios.get.mockResolvedValue({
      data: {
        title_en: 'Diabetes Basics',
        title_de: 'Diabetes Grundlagen',
        content_en: '<p>Article content</p>',
        content_de: '<p>Inhalt</p>',
        category_en: 'Health',
        category_de: 'Gesundheit',
      },
    });
    renderPage();

    expect(await screen.findByText('Diabetes Basics')).toBeInTheDocument();
  });

  it('navigates back to /knowledge when back button clicked', async () => {
    axios.get.mockResolvedValue({
      data: {
        title_en: 'Title',
        content_en: 'Content',
        category_en: 'Cat',
      },
    });
    renderPage();

    // Erst warten, bis die Seite geladen ist
    const backBtn = await screen.findByText('knowledge.btnBack');
    fireEvent.click(backBtn);
    
    expect(mockNavigate).toHaveBeenCalledWith('/knowledge');
  });

  it('fetches the correct article by id', async () => {
    axios.get.mockResolvedValue({ data: { title_en: 'T', content_en: 'C', category_en: 'X' } });
    renderPage();
    
    // Wir warten kurz, bis die API-Abfrage durch ist
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/admin/knowledge/5');
    });
  });
});