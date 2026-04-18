import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LanguageSwitcher from '../../src/components/LanguageSwitcher';

const changeLanguage = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'en',
      changeLanguage,
    },
  }),
}));

describe('LanguageSwitcher Component', () => {
  beforeEach(() => {
    changeLanguage.mockClear();
  });

  it('renders EN and DE buttons', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText(/EN/)).toBeInTheDocument();
    expect(screen.getByText(/DE/)).toBeInTheDocument();
  });

  it('calls changeLanguage("en") when EN is clicked', () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByText(/EN/));
    expect(changeLanguage).toHaveBeenCalledWith('en');
  });

  it('calls changeLanguage("de") when DE is clicked', () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByText(/DE/));
    expect(changeLanguage).toHaveBeenCalledWith('de');
  });

  it('highlights the current language (EN) as active', () => {
    render(<LanguageSwitcher />);
    const enBtn = screen.getByText(/EN/);
    expect(enBtn).toHaveStyle('font-weight: bold');
  });
});
