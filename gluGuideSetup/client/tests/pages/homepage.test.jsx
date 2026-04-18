import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Homepage from '../../src/pages/homepage';
import axios from '../../src/api/axiosConfig';

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

vi.mock('../../src/components/GlucoseLog', () => ({
  default: () => <div data-testid="glucose-log">GlucoseLog</div>,
}));

vi.mock('../../src/components/DailyEmpowermentWidget', () => ({
  default: () => <div data-testid="empowerment">Empowerment</div>,
}));

vi.mock('../../src/components/PostCard', () => ({
  default: ({ post }) => <div data-testid={`post-${post.id}`}>{post.title}</div>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('Homepage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderHomepage = () =>
    render(
      <MemoryRouter>
        <Homepage />
      </MemoryRouter>
    );

  it('shows loading state initially', () => {
    // Bleibt im Pending-Zustand
    global.fetch.mockImplementation(() => new Promise(() => {})); 
    axios.get.mockResolvedValue({ data: [] });
    
    renderHomepage();
    expect(screen.getByText('homepage.loading')).toBeInTheDocument();
  });

  it('renders GlucoseLog and empowerment when user is logged in', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ valid: true }),
    });
    axios.get.mockResolvedValue({ data: [] });

    renderHomepage();

    // findBy wartet automatisch darauf, dass der Ladezustand beendet wird
    expect(await screen.findByTestId('glucose-log')).toBeInTheDocument();
    expect(screen.getByTestId('empowerment')).toBeInTheDocument();
  });

  it('renders hero section and features when not logged in', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ valid: false }),
    });
    axios.get.mockResolvedValue({ data: [] });

    renderHomepage();

    expect(await screen.findByText('homepage.heroTitle')).toBeInTheDocument();
    expect(screen.getByText('homepage.heroDescription')).toBeInTheDocument();
    expect(screen.getByText('homepage.feature1')).toBeInTheDocument();
  });

  it('renders latest posts when fetched successfully', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ valid: false }),
    });
    axios.get.mockResolvedValue({
      data: [
        { id: 1, title: 'Post1', created_at: '2025-01-01' },
        { id: 2, title: 'Post2', created_at: '2025-02-01' },
      ],
    });

    renderHomepage();

    expect(await screen.findByTestId('post-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-2')).toBeInTheDocument();
  });

  it('treats non-ok status response as logged out', async () => {
    global.fetch.mockResolvedValue({ ok: false });
    axios.get.mockResolvedValue({ data: [] });

    renderHomepage();

    expect(await screen.findByText('homepage.heroTitle')).toBeInTheDocument();
  });

  it('treats fetch errors as logged out', async () => {
    global.fetch.mockRejectedValue(new Error('network'));
    axios.get.mockResolvedValue({ data: [] });

    renderHomepage();

    expect(await screen.findByText('homepage.heroTitle')).toBeInTheDocument();
  });

  it('shows error message when posts fetch fails', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ valid: false }),
    });
    axios.get.mockRejectedValue(new Error('fail'));

    renderHomepage();

    expect(await screen.findByText('homepage.blogError')).toBeInTheDocument();
  });
});