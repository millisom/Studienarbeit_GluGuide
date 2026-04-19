import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Blogs from '../../src/pages/blogs'; 


vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));


vi.mock('../../src/components/CreatePost', () => ({
  default: () => <div data-testid="mock-create-post">Mocked Create Post</div>,
}));

vi.mock('../../src/components/ViewBlogEntries', () => ({
  default: () => <div data-testid="mock-view-blog-entries">Mocked View Blog Entries</div>,
}));

describe('Blogs Page', () => {
  it('renders the page title correctly', () => {
    render(<Blogs />);
    

    expect(screen.getByText('blogs.pageTitle')).toBeInTheDocument();
  });

  it('contains the CreatePost and ViewBlogEntries components', () => {
    render(<Blogs />);

 
    expect(screen.getByTestId('mock-create-post')).toBeInTheDocument();
    expect(screen.getByTestId('mock-view-blog-entries')).toBeInTheDocument();
  });

  it('applies the correct CSS module classes', () => {
    const { container } = render(<Blogs />);
    

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('blogs');


    const sections = container.querySelectorAll('.section');
    expect(sections.length).toBe(2);
  });
});