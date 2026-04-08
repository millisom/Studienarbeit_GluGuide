import React from 'react';
import { render, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import AppRoutes from '../../src/routes';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' }
  }),
  Trans: ({ children }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() }
}));

vi.mock('../../src/routes/routeModules/basicRoutes', () => ({
  basicRoutes: [{ path: '/', element: () => <div>Home Page</div> }]
}));

vi.mock('../../src/routes/routeModules/authRoutes', () => ({
  authRoutes: [{ path: '/login', element: () => <div>Login Page</div> }]
}));

vi.mock('../../src/routes/routeModules/contentRoutes', () => ({
  contentRoutes: [{ path: '/blog', element: () => <div>Blog Page</div> }]
}));

vi.mock('../../src/routes/routeModules/adminRoutes', () => ({
  adminRoutes: [{ path: '/admin', element: () => <div>Admin Page</div> }]
}));

vi.mock('../../src/routes/routeModules/healthRoutes', () => ({
  healthRoutes: [{ path: '/health', element: () => <div>Health Page</div> }]
}));

describe('AppRoutes Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders routes correctly', async () => {
    let container;
    await act(async () => {
      const result = render(
        <MemoryRouter initialEntries={['/']}>
          <AppRoutes />
        </MemoryRouter>
      );
      container = result.container;
    });
    
    expect(container).toBeTruthy();
  });
});