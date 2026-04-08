import { expect, describe, it, vi } from 'vitest';

vi.mock('react', () => ({
  lazy: fn => fn,
}));

vi.mock('../../../src/pages/AdminDashboard', () => ({ default: 'AdminDashboard' }));
vi.mock('../../../src/pages/AdminCreateUser', () => ({ default: 'AdminCreateUser' }));
vi.mock('../../../src/pages/AdminEditUser', () => ({ default: 'AdminEditUser' }));
vi.mock('../../../src/pages/AdminEditPost', () => ({ default: 'AdminEditPost' }));
vi.mock('../../../src/pages/AdminCreateKnowledge', () => ({ default: 'AdminCreateKnowledge' }));
vi.mock('../../../src/pages/AdminEditKnowledge', () => ({ default: 'AdminEditKnowledge' }));

import { adminRoutes } from '../../../src/routes/routeModules/adminRoutes';

describe('adminRoutes', () => {
  it('should export an array of routes', () => {
    expect(Array.isArray(adminRoutes)).toBe(true);
    expect(adminRoutes.length).toBe(6);
  });

  it('should contain the correct paths', () => {
    const paths = adminRoutes.map(route => route.path);
    expect(paths).toContain('/admin');
    expect(paths).toContain('/admin/createUser');
    expect(paths).toContain('/admin/editUser/:id');
    expect(paths).toContain('/admin/editPost/:id');
    expect(paths).toContain('/admin/createKnowledge');
    expect(paths).toContain('/admin/editKnowledge/:id');
  });

  it('should have the correct route elements', () => {
    const routeMap = adminRoutes.reduce((acc, route) => {
      acc[route.path] = route.element;
      return acc;
    }, {});

    expect(typeof routeMap['/admin']).toBe('function');
    expect(typeof routeMap['/admin/createUser']).toBe('function');
    expect(typeof routeMap['/admin/editUser/:id']).toBe('function');
    expect(typeof routeMap['/admin/editPost/:id']).toBe('function');
    expect(typeof routeMap['/admin/createKnowledge']).toBe('function');
    expect(typeof routeMap['/admin/editKnowledge/:id']).toBe('function');
  });
});