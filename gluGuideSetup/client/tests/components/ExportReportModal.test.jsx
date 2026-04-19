import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ExportReportModal from '../../src/components/ExportReportModal';
import axiosInstance from '../../src/api/axiosConfig';



const stableT = (key, params) => {
  if (params?.count !== undefined) return `${key}_count_${params.count}`;
  return key;
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
    i18n: { language: 'de' }
  })
}));

vi.mock('../../src/api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

if (typeof window.URL.createObjectURL === 'undefined') {
  window.URL.createObjectURL = vi.fn(() => 'mock-url');
  window.URL.revokeObjectURL = vi.fn();
}

describe('ExportReportModal Component', () => {
  const mockDates = ['2023-10-01', '2023-10-02', '2023-10-03'];
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    axiosInstance.get.mockResolvedValue({ data: { dates: mockDates } });
  });

  it('returns null when isOpen is false', () => {
    const { container } = render(<ExportReportModal isOpen={false} onClose={onClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('fetches and displays dates when opened', async () => {
    render(<ExportReportModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('exportModal.loadingDates')).toBeInTheDocument();
    

    const checkboxes = await screen.findAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    expect(axiosInstance.get).toHaveBeenCalledWith('/export/dates?range=month');
  });

  it('toggles individual date selection', async () => {
    render(<ExportReportModal isOpen={true} onClose={onClose} />);

    const checkboxes = await screen.findAllByRole('checkbox');
    

    expect(checkboxes[0]).toBeChecked();


    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).not.toBeChecked();
    expect(screen.getByText('exportModal.daysSelected_count_2')).toBeInTheDocument();
  });

  it('toggles "Select All" functionality', async () => {
    render(<ExportReportModal isOpen={true} onClose={onClose} />);

    const selectAllBtn = await screen.findByText('exportModal.btnUnselectAll');
    

    fireEvent.click(selectAllBtn);
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(cb => expect(cb).not.toBeChecked());
    expect(screen.getByText('exportModal.daysSelected_count_0')).toBeInTheDocument();


    const reselectBtn = screen.getByText('exportModal.btnSelectAll');
    fireEvent.click(reselectBtn);
    checkboxes.forEach(cb => expect(cb).toBeChecked());
  });

  it('triggers PDF export and handles file download', async () => {
    const mockBlob = new Blob(['dummy content'], { type: 'application/pdf' });
    axiosInstance.post.mockResolvedValue({ data: mockBlob });
    

    const linkClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<ExportReportModal isOpen={true} onClose={onClose} />);

    const downloadBtn = await screen.findByText('exportModal.btnDownload');
    fireEvent.click(downloadBtn);

    expect(screen.getByText('exportModal.btnDownloading')).toBeInTheDocument();

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/export/generate',
        { selectedDates: mockDates },
        { responseType: 'blob' }
      );
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(linkClickSpy).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows error message when fetching dates fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    axiosInstance.get.mockRejectedValue(new Error('Fetch error'));

    render(<ExportReportModal isOpen={true} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('exportModal.noData')).toBeInTheDocument();
    });
  });

  it('shows alert if export fails', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    axiosInstance.post.mockRejectedValue(new Error('Export error'));

    render(<ExportReportModal isOpen={true} onClose={onClose} />);
    
    const downloadBtn = await screen.findByText('exportModal.btnDownload');
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('exportModal.alertError');
    });
  });

  it('re-fetches dates when range selector changes', async () => {
    render(<ExportReportModal isOpen={true} onClose={onClose} />);
    
    await screen.findAllByRole('checkbox'); // Initialer Load

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'week' } });

    expect(axiosInstance.get).toHaveBeenCalledWith('/export/dates?range=week');
  });
});