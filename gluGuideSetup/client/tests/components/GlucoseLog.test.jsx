import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GlucoseLog from '../../src/components/GlucoseLog';
import axios from '../../src/api/axiosConfig';
import { AuthContext } from '../../src/context/AuthContext';

// Mocking axios
vi.mock('../../src/api/axiosConfig');

// Mocking Recharts (Diagramme sind im Test schwer zu rendern)
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="chart-container">{children}</div>,
  LineChart: ({ children }) => <div>{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

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

    // Axios GET Mocks
    axios.get.mockImplementation((url) => {
      if (url.includes('/glucose/')) return Promise.resolve({ data: mockLogs });
      return Promise.reject(new Error(`Not found: ${url}`));
    });

    // Axios DELETE Mock
    axios.delete.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
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

  it('ruft Delete-API auf beim Klicken und zeigt Erfolgsmeldung', async () => {
    // 1. Manueller Mock für confirm erstellen
    const confirmMock = vi.fn(() => true);
    
    // 2. Global und auf window-Objekt stubben (Doppelte Absicherung)
    vi.stubGlobal('confirm', confirmMock);
    window.confirm = confirmMock;

    renderWithAuthProvider(<GlucoseLog />);
    
    // Filter auf 'all' stellen, damit die Tabelle befüllt wird
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'all' } });

    // Warten, bis die Delete-Buttons im DOM gerendert wurden
    const deleteButtons = await screen.findAllByText('Delete');
    
    // Löschvorgang auslösen
    fireEvent.click(deleteButtons[0]);

    // 3. Verifizieren: Wurde confirm aufgerufen? 
    // Wir prüfen die Referenz confirmMock direkt.
    await waitFor(() => {
      expect(confirmMock).toHaveBeenCalled();
    }, { timeout: 2000 });

    // 4. Verifizieren: Wurde die richtige API-Route aufgerufen?
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/glucose/log/1'),
        expect.anything()
      );
    });

    // 5. Verifizieren: Erscheint die Erfolgsmeldung in der UI?
    await waitFor(() => {
      expect(screen.getByText(/Log deleted!/i)).toBeInTheDocument();
    });
  });
});