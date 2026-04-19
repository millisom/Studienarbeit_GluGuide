import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PrivacyPolicy from '../../src/pages/PrivacyPolicy';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
  Trans: ({ children }) => children,
}));

describe('PrivacyPolicy Page', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    );

  it('renders title and lastUpdated label', () => {
    renderPage();
    expect(screen.getByText('privacyPolicy.title')).toBeInTheDocument();
    expect(screen.getByText('privacyPolicy.lastUpdated')).toBeInTheDocument();
  });

  it('renders section 1', () => {
    renderPage();
    expect(screen.getByText('privacyPolicy.s1.title')).toBeInTheDocument();
    expect(screen.getByText('privacyPolicy.s1.content')).toBeInTheDocument();
  });

  it('renders section 2 with data categories', () => {
    renderPage();
    expect(screen.getByText('privacyPolicy.s2.title')).toBeInTheDocument();
    expect(screen.getByText('privacyPolicy.s2.intro')).toBeInTheDocument();
  });

  it('renders section 3 about data usage', () => {
    renderPage();
    expect(screen.getByText('privacyPolicy.s3.title')).toBeInTheDocument();
  });

  it('renders section 4 and 5 titles', () => {
    renderPage();
    expect(screen.getByText('privacyPolicy.s4.title')).toBeInTheDocument();
    expect(screen.getByText('privacyPolicy.s5.title')).toBeInTheDocument();
  });
});
