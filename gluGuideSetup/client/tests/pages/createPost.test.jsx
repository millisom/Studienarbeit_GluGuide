import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CreatePostPage from '../../src/pages/createPost';

vi.mock('../../src/components/CreatePost', () => ({
  default: () => <div data-testid="create-post">CreatePost</div>,
}));

describe('CreatePost Page', () => {
  it('renders the CreatePost component', () => {
    render(<CreatePostPage />);
    expect(screen.getByTestId('create-post')).toBeInTheDocument();
  });
});
