import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Footer from '../../src/components/Footer';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

describe('Footer Component', () => {
  it('renders copyright with current year', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${year} GluGuide`))).toBeInTheDocument();
  });

  it('renders contact and about nav links', () => {
    render(<Footer />);
    const contact = screen.getByText('footer.contact');
    const about = screen.getByText('footer.about');

    expect(contact.closest('a')).toHaveAttribute('href', '/contact');
    expect(about.closest('a')).toHaveAttribute('href', '/about');
  });

  it('renders translation key for rights notice', () => {
    render(<Footer />);
    expect(screen.getByText(/footer\.rights/)).toBeInTheDocument();
  });

  it('renders a footer landmark element', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});
