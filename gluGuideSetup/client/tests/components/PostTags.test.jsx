import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PostTags from '../../src/components/PostTags';

// Mocking der CSS Modules
vi.mock('../../src/styles/ViewBlogEntries.module.css', () => ({
  default: {
    tagsContainer: 'tagsContainer',
    tagItem: 'tagItem',
    selectedTagInCard: 'selectedTagInCard',
  }
}));

describe('PostTags Component', () => {
  const defaultTags = ['react', 'javascript', 'node'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tags properly', () => {
    render(<PostTags tags={defaultTags} selectedTags={['react']} setSelectedTags={vi.fn()} />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByText('node')).toBeInTheDocument();
  });

  it('calls setSelectedTags with added tag when clicking an unselected tag', () => {
    const setSelectedTags = vi.fn();
    render(<PostTags tags={defaultTags} selectedTags={['react']} setSelectedTags={setSelectedTags} />);
    
    fireEvent.click(screen.getByText('javascript'));
    
    // Erwartet das Hinzufügen zum bestehenden Array
    expect(setSelectedTags).toHaveBeenCalledWith(['react', 'javascript']);
  });

  it('calls setSelectedTags with removed tag when clicking an already selected tag (Toggle)', () => {
    const setSelectedTags = vi.fn();
    render(<PostTags tags={defaultTags} selectedTags={['react', 'node']} setSelectedTags={setSelectedTags} />);
    
    fireEvent.click(screen.getByText('react'));
    
    // NEU: Erwartet das Entfernen (nur 'node' bleibt übrig)
    expect(setSelectedTags).toHaveBeenCalledWith(['node']);
  });

  it('stops event propagation when clicking a tag', () => {
    const setSelectedTags = vi.fn();
    render(<PostTags tags={defaultTags} selectedTags={[]} setSelectedTags={setSelectedTags} />);
    
    const tagButton = screen.getByText('javascript');
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    
    // Spion auf stopPropagation setzen
    const stopSpy = vi.spyOn(clickEvent, 'stopPropagation');
    
    fireEvent(tagButton, clickEvent);
    
    expect(stopSpy).toHaveBeenCalled();
  });

  it('applies selected class to selected tags only', () => {
    const { container } = render(<PostTags tags={defaultTags} selectedTags={['react']} setSelectedTags={vi.fn()} />);
    const buttons = container.querySelectorAll('button');
    
    expect(buttons[0]).toHaveClass('selectedTagInCard'); // react
    expect(buttons[1]).not.toHaveClass('selectedTagInCard'); // javascript
    expect(buttons[2]).not.toHaveClass('selectedTagInCard'); // node
  });

  it('renders nothing if tags array is empty', () => {
    const { container } = render(<PostTags tags={[]} selectedTags={[]} setSelectedTags={vi.fn()} />);
    
    // Da die Komponente jetzt 'null' zurückgibt, darf der Container nicht existieren
    expect(container.firstChild).toBeNull();
  });

  it('handles multiple selected tags correctly', () => {
    render(<PostTags tags={defaultTags} selectedTags={['react', 'javascript']} setSelectedTags={vi.fn()} />);
    
    expect(screen.getByText('react')).toHaveClass('selectedTagInCard');
    expect(screen.getByText('javascript')).toHaveClass('selectedTagInCard');
    expect(screen.getByText('node')).not.toHaveClass('selectedTagInCard');
  });

  it('adds the last unselected tag correctly', () => {
    const setSelectedTags = vi.fn();
    render(<PostTags tags={defaultTags} selectedTags={['react', 'javascript']} setSelectedTags={setSelectedTags} />);
    
    fireEvent.click(screen.getByText('node'));
    expect(setSelectedTags).toHaveBeenCalledWith(['react', 'javascript', 'node']);
  });

  it('handles undefined tags array gracefully', () => {
    const { container } = render(<PostTags tags={undefined} selectedTags={[]} setSelectedTags={vi.fn()} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('handles non-array tags input without crashing', () => {
    const { container } = render(<PostTags tags={'not-an-array'} selectedTags={[]} setSelectedTags={vi.fn()} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly if selectedTags is undefined', () => {
    render(<PostTags tags={defaultTags} selectedTags={undefined} setSelectedTags={vi.fn()} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    buttons.forEach(btn => {
      expect(btn).not.toHaveClass('selectedTagInCard');
    });
  });

  it('applies correct CSS classes to the container and tags', () => {
    const { container } = render(<PostTags tags={defaultTags} selectedTags={['react']} setSelectedTags={vi.fn()} />);
    
    expect(container.firstChild).toHaveClass('tagsContainer');
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).toHaveClass('tagItem'));
  });
});