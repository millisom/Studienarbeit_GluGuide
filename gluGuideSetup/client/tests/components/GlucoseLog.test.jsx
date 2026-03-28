import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GlucoseLog from '../../src/components/GlucoseLog';
import axios from '../../src/api/axiosConfig';
import { AuthContext } from '../../src/context/AuthContext';

// 🔥 FIX: Import and completely mock the mealApi so we bypass Axios for meals
import { getAllMealsForUser } from '../../src/api/mealApi';

vi.mock('../../src/api/mealApi', () => ({
  getAllMealsForUser: vi.fn(),
}));

// Mocking axios (For the glucose endpoints)
vi.mock('../../src/api/axiosConfig');

// Mocking Recharts
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
  // Ensure we provide 'meal_id' so it can map to the meals array
  const mockLogs = [
    { id: 1, date: '2023-01-01', time: '12:00', glucose_level: 120, meal_id: 1 },
    { id: 2, date: '2023-01-01', time: '14:00', glucose_level: 140, meal_id: 2 }
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

    // Axios GET Mocks (For Glucose Logs)
    axios.get.mockImplementation((url) => {
      if (url.includes('/glucose/')) return Promise.resolve({ data: mockLogs });
      return Promise.reject(new Error(`Not found: ${url}`));
    });

    // 🔥 FIX: Directly return the meals from the API helper function!
    // Included both 'id' and 'meal_id' just in case your component uses either one
    getAllMealsForUser.mockResolvedValue([
      { id: 1, meal_id: 1, meal_type: 'Breakfast', name: 'Breakfast' },
      { id: 2, meal_id: 2, meal_type: 'Lunch', name: 'Lunch' }
    ]);

    // Axios DELETE Mock
    axios.delete.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('lädt Daten und zeigt sie an inkl. verknüpfter Mahlzeit (nach Filter-Wechsel auf "All")', async () => {
    renderWithAuthProvider(<GlucoseLog />);

    // Grab the Filter dropdown (Index 1)
    const selects = screen.getAllByRole('combobox'); 
    fireEvent.change(selects[1], { target: { value: 'all' } });

    await waitFor(() => {
      expect(screen.getAllByText(/120/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/140/)[0]).toBeInTheDocument();
      
      // Now that mealApi is mocked, these will successfully map and render!
      expect(screen.getAllByText(/Breakfast/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Lunch/i)[0]).toBeInTheDocument();
    });
  });

  it('zeigt das Diagramm an', async () => {
    renderWithAuthProvider(<GlucoseLog />);
    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  it('ruft Delete-API auf beim Klicken und zeigt Erfolgsmeldung', async () => {
    const confirmMock = vi.fn(() => true);
    
    vi.stubGlobal('confirm', confirmMock);
    window.confirm = confirmMock;

    renderWithAuthProvider(<GlucoseLog />);
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'all' } });

    const deleteButtons = await screen.findAllByText('Delete');
    
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(confirmMock).toHaveBeenCalled();
    }, { timeout: 2000 });

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/glucose/log/1'),
        expect.anything()
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText(/Log deleted!/i)[0]).toBeInTheDocument();
    });
  });
});