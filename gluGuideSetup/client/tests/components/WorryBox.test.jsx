import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from '../../src/api/axiosConfig';
import WorryBox from '../../src/components/WorryBox';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../src/api/axiosConfig', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock('react-quill', () => ({
  default: ({ value, onChange, placeholder }) => (
    <textarea
      data-testid="mock-quill"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe('WorryBox Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders title and buttons', async () => {
    axios.get.mockResolvedValue({ data: {} });
    await act(async () => {
      render(<WorryBox />);
    });
    expect(screen.getByText('worryBox.title')).toBeInTheDocument();
    expect(screen.getByText('worryBox.btnClear')).toBeInTheDocument();
    expect(screen.getByText('worryBox.btnSave')).toBeInTheDocument();
  });

  it('loads existing content on mount', async () => {
    axios.get.mockResolvedValue({ data: { content: 'existing note' } });
    await act(async () => {
      render(<WorryBox />);
    });
    await waitFor(() => {
      expect(screen.getByTestId('mock-quill')).toHaveValue('existing note');
    });
  });

  it('handles load failure gracefully', async () => {
    axios.get.mockRejectedValue(new Error('fail'));
    await act(async () => {
      render(<WorryBox />);
    });
    expect(screen.getByText('worryBox.title')).toBeInTheDocument();
  });

  it('saves note when Save is clicked', async () => {
    axios.get.mockResolvedValue({ data: {} });
    axios.post.mockResolvedValue({ data: {} });
    await act(async () => {
      render(<WorryBox />);
    });

    fireEvent.change(screen.getByTestId('mock-quill'), { target: { value: 'my worry' } });

    await act(async () => {
      fireEvent.click(screen.getByText('worryBox.btnSave'));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/worry-box', { content: 'my worry' });
    });
  });

  it('clears note when user confirms', async () => {
    axios.get.mockResolvedValue({ data: { content: 'old' } });
    axios.post.mockResolvedValue({ data: {} });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await act(async () => {
      render(<WorryBox />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('worryBox.btnClear'));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/worry-box', { content: '' });
    });
  });

  it('does not clear when user cancels confirmation', async () => {
    axios.get.mockResolvedValue({ data: { content: 'old' } });
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    await act(async () => {
      render(<WorryBox />);
    });

    axios.post.mockClear();

    await act(async () => {
      fireEvent.click(screen.getByText('worryBox.btnClear'));
    });

    expect(axios.post).not.toHaveBeenCalled();
  });
});
