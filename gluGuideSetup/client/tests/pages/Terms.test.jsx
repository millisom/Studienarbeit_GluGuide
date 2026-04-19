import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Terms from '../../src/pages/Terms';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
  Trans: ({ children }) => children,
}));

describe('Terms Page', () => {
  const renderTerms = () =>
    render(
      <MemoryRouter>
        <Terms />
      </MemoryRouter>
    );

  it('renders the page title', () => {
    renderTerms();
    expect(screen.getByText('terms.title')).toBeInTheDocument();
  });

  it('renders lastUpdated label', () => {
    renderTerms();
    expect(screen.getByText('terms.lastUpdated')).toBeInTheDocument();
  });

  it('renders multiple section titles', () => {
    renderTerms();
    expect(screen.getByText('terms.s1.title')).toBeInTheDocument();
    expect(screen.getByText('terms.s2.title')).toBeInTheDocument();
    expect(screen.getByText('terms.s3.title')).toBeInTheDocument();
  });

  it('renders the medical disclaimer', () => {
    renderTerms();
    expect(screen.getByText('terms.s2.disclaimer')).toBeInTheDocument();
  });
});
