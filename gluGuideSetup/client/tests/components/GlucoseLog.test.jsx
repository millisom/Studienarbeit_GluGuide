// src/tests/components/GlucoseLog.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GlucoseLog from '../../src/components/GlucoseLog';
import axios from '../../src/api/axiosConfig';

// 1. Mock Axios
vi.mock('../../src/api/axiosConfig');

// 2. Mock Recharts
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
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

beforeEach(() => {
    vi.clearAllMocks();
    
    // 1. Axios Mocks
    axios.get.mockImplementation((url) => {
      if (url.includes('/currentUser')) return Promise.resolve({ data: { userId: 123 } });
      if (url.includes('/glucose/')) return Promise.resolve({ data: mockLogs });
      return Promise.reject(new Error(`Not found: ${url}`));
    });
    axios.delete.mockResolvedValue({ data: { success: true } });

    // 2. Window Confirm Mock (Explizit auf dem window Objekt)
    // Wir nutzen vi.spyOn, das ist zuverlässiger als stubGlobal für window-Methoden
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('lädt Daten und zeigt sie an (nach Filter-Wechsel auf "All")', async () => {
    render(<GlucoseLog />);

    // 1. Filter auf "All" setzen, damit das Datum egal ist
    const select = screen.getByRole('combobox'); 
    fireEvent.change(select, { target: { value: 'all' } });

    // 2. Warten auf Daten
    await waitFor(() => {
      // Jetzt sollte der Mock antworten und die Daten anzeigen
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('140')).toBeInTheDocument();
    });
  });

  it('zeigt das Diagramm an', async () => {
    render(<GlucoseLog />);
    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

it('ruft Delete-API auf beim Klicken', async () => {
    render(<GlucoseLog />);
    
    // 1. Filter auf "All" setzen
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'all' } });

    // 2. Warten bis Daten geladen sind (Text "120" erscheint)
    await waitFor(() => expect(screen.getByText('120')).toBeInTheDocument());

    // 3. Delete-Button finden
    // FIX: Wir suchen einfach nach dem Text "Delete". Das ist viel robuster.
    // Da es mehrere Einträge geben kann, nehmen wir getAllByText und davon den ersten.
    const deleteButtons = screen.getAllByText('Delete');
    const firstDeleteButton = deleteButtons[0];
    
    expect(firstDeleteButton).toBeInTheDocument();

    // 4. Klicken
    fireEvent.click(firstDeleteButton);

    // 5. Prüfen
    expect(window.confirm).toHaveBeenCalled();
    expect(axios.delete).toHaveBeenCalled();
  });
});