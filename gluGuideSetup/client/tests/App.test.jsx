import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import App from '../src/App';

// i18n Mock hinzufügen (inkl. initReactI18next)
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() }
  }),
  Trans: ({ children }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() }
}));

// Mock the AppRoutes component
vi.mock('../src/routes', () => ({
  default: () => <div data-testid="app-routes">Mocked Routes</div>
}));

// Mock the AppLayout component
vi.mock('../src/components/layout/AppLayout', () => ({
  default: ({ children }) => (
    <div data-testid="app-layout">
      <div>{children}</div>
    </div>
  )
}));

describe('App Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders AppLayout and AppRoutes', async () => {
    await act(async () => {
      render(<App />);
    });
    
    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    expect(screen.getByTestId('app-routes')).toBeInTheDocument();
    expect(screen.getByText('Mocked Routes')).toBeInTheDocument();
  });
});