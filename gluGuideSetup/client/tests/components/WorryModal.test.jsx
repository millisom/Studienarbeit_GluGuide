import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WorryModal from '../../src/components/WorryModal';

vi.mock('../../src/components/WorryBox', () => ({
  default: () => <div data-testid="mock-worry-box">WorryBox</div>,
}));

describe('WorryModal Component', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(<WorryModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders WorryBox when isOpen is true', () => {
    render(<WorryModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByTestId('mock-worry-box')).toBeInTheDocument();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<WorryModal isOpen={true} onClose={onClose} />);
    fireEvent.click(container.firstChild);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<WorryModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not close when clicking inside modal content', () => {
    const onClose = vi.fn();
    render(<WorryModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('mock-worry-box'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
