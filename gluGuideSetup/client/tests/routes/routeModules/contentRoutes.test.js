import { describe, it, expect, vi } from 'vitest';
import { contentRoutes } from '../../../src/routes/routeModules/contentRoutes';

vi.mock('react', () => ({
  lazy: vi.fn(importFn => importFn)
}));

vi.mock('../../../src/pages/blogs.jsx', () => ({ default: () => null }));
vi.mock('../../../src/components/viewPost.jsx', () => ({ default: () => null }));
vi.mock('../../../src/components/editPost.jsx', () => ({ default: () => null }));
vi.mock('../../../src/pages/createPost.jsx', () => ({ default: () => null }));
vi.mock('../../../src/pages/myBlogs.jsx', () => ({ default: () => null }));
vi.mock('../../../src/components/UserProfile.jsx', () => ({ default: () => null }));
vi.mock('../../../src/pages/KnowledgeBasePage', () => ({ default: () => null }));
vi.mock('../../../src/pages/ArticleView', () => ({ default: () => null }));

describe('Content Routes Module', () => {
  it('should export the correct routes', () => {
    expect(Array.isArray(contentRoutes)).toBe(true);
    
    expect(contentRoutes.length).toBe(9);
    
    expect(contentRoutes).toContainEqual(
      expect.objectContaining({ path: '/blogs' })
    );
    expect(contentRoutes).toContainEqual(
      expect.objectContaining({ path: '/blogs/view/:id' })
    );
    expect(contentRoutes).toContainEqual(
      expect.objectContaining({ path: '/blogs/edit/:id' })
    );
    expect(contentRoutes).toContainEqual(
      expect.objectContaining({ path: '/create/post' })
    );
    expect(contentRoutes).toContainEqual(
      expect.objectContaining({ path: '/myBlogs' })
    );
    expect(contentRoutes).toContainEqual(
      expect.objectContaining({ path: '/viewPost/:id' })
    );
    expect(contentRoutes).toContainEqual(
      expect.objectContaining({ path: '/profile/:username' })
    );
    expect(contentRoutes).toContainEqual(
      expect.objectContaining({ path: '/knowledge' })
    );
    expect(contentRoutes).toContainEqual(
      expect.objectContaining({ path: '/knowledge/:id' })
    );
  });
  
  it('should have the correct element properties', () => {
    contentRoutes.forEach(route => {
      expect(route).toHaveProperty('element');
      expect(typeof route.element).toBe('function');
    });
  });
});