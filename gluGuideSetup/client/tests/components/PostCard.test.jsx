import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import PostCard from '../../src/components/PostCard';


vi.mock('../../src/components/PostTags', () => ({
  default: ({ tags }) => <div data-testid="post-tags">{tags.join(',')}</div>
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }) => {
    const iconName = typeof icon === 'object' && icon.iconName ? icon.iconName : 'unknown';
    return <span data-testid={`icon-${iconName}`} />;
  }
}));

const renderWithProviders = (ui, authValue) => {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>{ui}</MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('PostCard Component', () => {
  const mockPost = {
    id: 123,
    title: 'Test Post',
    username: 'testuser',
    created_at: '2025-05-01T12:00:00Z',
    likes: [1, 2, 3],
    likes_count: 3,
    tags: ['react', 'testing'],
    post_picture: 'test-image.jpg'
  };

  const defaultAuth = { isAdmin: false, user: { username: 'testuser' } };

  it('renders post information correctly', () => {
    renderWithProviders(<PostCard post={mockPost} handleViewClick={vi.fn()} setSelectedTags={vi.fn()} />, defaultAuth);
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders admin actions when isAdmin is true', () => {
    renderWithProviders(<PostCard post={mockPost} handleViewClick={vi.fn()} setSelectedTags={vi.fn()} />, { isAdmin: true, user: {} });
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});