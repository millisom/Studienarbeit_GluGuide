import { expect, describe, it, vi } from 'vitest';

// Mock React's lazy loading
vi.mock('react', () => ({
  lazy: fn => fn,
}));

// Mock the imported components (Add the new ones here!)
vi.mock('../../../src/pages/homepage.jsx', () => ({ default: 'HomePage' }));
vi.mock('../../../src/pages/contactUs.jsx', () => ({ default: 'ContactUs' }));
vi.mock('../../../src/pages/aboutUs.jsx', () => ({ default: 'AboutUs' }));
vi.mock('../../../src/pages/PrivacyPolicy.jsx', () => ({ default: 'PrivacyPolicy' }));
vi.mock('../../../src/pages/Terms.jsx', () => ({ default: 'Terms' }));

// Import the routes after mocking the dependencies
import { basicRoutes } from '../../../src/routes/routeModules/basicRoutes';

describe('basicRoutes', () => {
  it('should export an array of routes', () => {
    expect(Array.isArray(basicRoutes)).toBe(true);
    // UPDATED: Expect 5 routes now
    expect(basicRoutes.length).toBe(5);
  });

  it('should contain the correct paths', () => {
    const paths = basicRoutes.map(route => route.path);
    expect(paths).toContain('/');
    expect(paths).toContain('/contact');
    expect(paths).toContain('/about');
    // ADDED: New paths
    expect(paths).toContain('/privacy');
    expect(paths).toContain('/terms');
  });

  it('should have the correct route elements', () => {
    const routeMap = basicRoutes.reduce((acc, route) => {
      acc[route.path] = route.element;
      return acc;
    }, {});

    expect(typeof routeMap['/']).toBe('function');
    expect(typeof routeMap['/contact']).toBe('function');
    expect(typeof routeMap['/about']).toBe('function');
    expect(typeof routeMap['/privacy']).toBe('function');
    expect(typeof routeMap['/terms']).toBe('function');
  });
});