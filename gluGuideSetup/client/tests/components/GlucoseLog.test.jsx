import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GlucoseLog from '../../src/components/GlucoseLog';
import { AuthContext } from '../../src/context/AuthContext';


vi.mock('react-i18next', () => {
  const stableT = (key) => key;
  const stableI18n = { language: 'en', changeLanguage: () => {} };
  
  return {
    useTranslation: () => ({
      t: stableT,
      i18n: stableI18n
    }),
    Trans: ({ children }) => <>{children}</>
  };
});


vi.mock('../../src/api/mealApi', () => ({
  getAllMealsForUser: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../src/api/axiosConfig', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn(), put: vi.fn() }
}));


vi.mock('../../src/hooks/useGlucoseData', () => ({
  useGlucoseData: () => ({
    logs: [],
    error: '',
    successMessage: '',
    filter: 'all',
    setFilter: vi.fn(),
    addLog: vi.fn(),
    deleteLog: vi.fn(),
    updateLog: vi.fn(),
    setSuccessMessage: vi.fn()
  })
}));


vi.mock('../../src/components/GlucoseChart', () => ({
  default: () => <div data-testid="mocked-chart">Mocked Chart</div>
}));

describe('GlucoseLog Component - Zero Loop Version', () => {
  const mockAuthValue = {
    user: { id: 123, username: 'TestUser' },
    isAdmin: false,
    loading: false
  };

  it('renders the page title without crashing', () => {
    render(
      <AuthContext.Provider value={mockAuthValue}>
        <GlucoseLog />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/glucoseLog\.pageTitle/i)).toBeInTheDocument();
  });
});