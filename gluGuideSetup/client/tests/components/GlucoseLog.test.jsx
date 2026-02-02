import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GlucoseLog from '../../src/components/GlucoseLog';
import axios from '../../src/api/axiosConfig';
import { AuthContext } from '../../src/context/AuthContext';


vi.mock('../../src/api/axiosConfig');


vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }) => <div data-testid="chart-container">{children}</div>,
    LineChart: ({ children }) => <div>{children}</div>,
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
  };
});

describe('GlucoseLog Integration', () => {
  const mockLogs = [
    { id: 1, date: '2023-01-01', time: '12:00', glucose_level: 120 },
    { id: 2, date: '2023-01-01', time: '14:00', glucose_level: 140 }
  ];

 
  const mockAuthValue = {
    user: { id: 123, username: 'TestUser' },
    loading: false
  };

 
  const renderWithAuthProvider = (ui, authValue = mockAuthValue) => {
    return render(
      <AuthContext.Provider value={authValue}>
        {ui}
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    

    axios.get.mockImplementation((url) => {
      if (url.includes('/currentUser')) return Promise.resolve({ data: { userId: 123 } });
      if (url.includes('/glucose/')) return Promise.resolve({ data: mockLogs });
      return Promise.reject(new Error(`Not found: ${url}`));
    });
    axios.delete.mockResolvedValue({ data: { success: true } });

    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('lädt Daten und zeigt sie an (nach Filter-Wechsel auf "All")', async () => {
    renderWithAuthProvider(<GlucoseLog />);

    const select = screen.getByRole('combobox'); 
    fireEvent.change(select, { target: { value: 'all' } });

    await waitFor(() => {
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('140')).toBeInTheDocument();
    });
  });

  it('zeigt das Diagramm an', async () => {
    renderWithAuthProvider(<GlucoseLog />);
    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  it('ruft Delete-API auf beim Klicken', async () => {
    renderWithAuthProvider(<GlucoseLog />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'all' } });

    await waitFor(() => expect(screen.getByText('120')).toBeInTheDocument());

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(axios.delete).toHaveBeenCalled();
  });
});