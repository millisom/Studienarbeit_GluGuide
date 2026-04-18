import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AboutUs from '../../src/pages/aboutUs';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
  Trans: ({ children }) => children,
}));

describe('AboutUs Page', () => {
  it('renders the main title', () => {
    render(<AboutUs />);
    expect(screen.getByText('aboutUs.mainTitle')).toBeInTheDocument();
  });

  it('renders the team section', () => {
    render(<AboutUs />);
    expect(screen.getByText('aboutUs.teamTitle')).toBeInTheDocument();
  });

  it('renders all current team members', () => {
    render(<AboutUs />);
    expect(screen.getByText('Emili')).toBeInTheDocument();
    expect(screen.getByText('Hossey')).toBeInTheDocument();
    expect(screen.getByText('Maja')).toBeInTheDocument();
    expect(screen.getByText('Nilgün')).toBeInTheDocument();
  });

  it('renders the special thanks section with Hafsa', () => {
    render(<AboutUs />);
    expect(screen.getByText('aboutUs.thanksTitle')).toBeInTheDocument();
    expect(screen.getByText('Hafsa')).toBeInTheDocument();
  });

  it('renders the closing statement', () => {
    render(<AboutUs />);
    expect(screen.getByText('aboutUs.closing')).toBeInTheDocument();
  });

  it('renders team member images with alt text', () => {
    const { container } = render(<AboutUs />);
    const images = container.querySelectorAll('img');
    expect(images.length).toBeGreaterThanOrEqual(5);
    images.forEach((img) => {
      expect(img).toHaveAttribute('alt');
      expect(img.getAttribute('alt')).toContain('profile');
    });
  });
});
