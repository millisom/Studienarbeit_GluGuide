import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import DailyEmpowermentWidget from '../../src/components/DailyEmpowermentWidget';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

describe('DailyEmpowermentWidget Component', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders title and a snippet after mount', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    render(<DailyEmpowermentWidget />);

    expect(screen.getByText('empowerment.dailyMotivationTitle')).toBeInTheDocument();
    expect(screen.getByText('empowerment.snippet1')).toBeInTheDocument();
  });

  it('picks different snippets for different random values', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    render(<DailyEmpowermentWidget />);
    expect(screen.getByText('empowerment.snippet4')).toBeInTheDocument();
  });
});
