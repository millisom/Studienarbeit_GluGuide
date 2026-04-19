import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AlertsTable from '../../src/components/AlertsTable';
import axiosInstance from '../../src/api/axiosConfig';
import { AuthContext } from '../../src/context/AuthContext';

// --- Mocks ---

// Stabile Übersetzungsfunktion - WICHTIG: Sie gibt den defaultValue zurück, wenn vorhanden
const stableT = (key, params) => {
  if (params?.defaultValue) return params.defaultValue;
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
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

const mockAlerts = [
  {
    alert_id: 1,
    reminder_frequency: 'daily',
    notification_method: 'app',
    reminder_time: '08:00:00',
    custom_message: 'Medikamente nehmen',
    created_at: '2023-01-01T10:00:00Z'
  },
  {
    alert_id: 2,
    reminder_frequency: 'once',
    notification_method: 'email',
    reminder_time: '2023-12-01T15:30:00',
    // Dieser wird als "Meal reminder: lunch" gerendert
    custom_message: JSON.stringify({ type: 'meal_reminder', meal_type: 'lunch' }),
    created_at: '2023-01-02T10:00:00Z'
  }
];

const mockAuthValue = {
  user: { id: 123, username: 'TestUser' }
};

describe('AlertsTable Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    axiosInstance.get.mockResolvedValue({ data: mockAlerts });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = (props = {}) => render(
    <AuthContext.Provider value={mockAuthValue}>
      <AlertsTable {...props} />
    </AuthContext.Provider>
  );

  it('renders table headers and fetches alerts on mount', async () => {
    renderComponent();
    expect(screen.getByText('alertsTable.header')).toBeInTheDocument();
    expect(await screen.findByText('Medikamente nehmen')).toBeInTheDocument();
  });

  it('formats meal reminders correctly', async () => {
    renderComponent();

    // FIX: Da dein stableT den defaultValue "Meal reminder" zurückgibt,
    // müssen wir nach dem tatsächlich gerenderten Text suchen, nicht nach dem Key-Namen.
    expect(await screen.findByText(/Meal reminder: lunch/i)).toBeInTheDocument();
  });

  it('shows empty state when no alerts exist', async () => {
    axiosInstance.get.mockResolvedValue({ data: [] });
    renderComponent();
    expect(await screen.findByText('alertsTable.noAlerts')).toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', async () => {
    renderComponent();
    
    const editBtns = await screen.findAllByText('alertsTable.btnEdit');
    fireEvent.click(editBtns[0]);

    // FIX: Da es zwei Select-Boxen (Frequenz und Methode) gibt, nutzen wir getAllByRole
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
    
    // Alternativ: Über den aktuellen Wert finden
    expect(screen.getByDisplayValue('08:00')).toBeInTheDocument();
    expect(screen.getByText('alertsTable.btnSave')).toBeInTheDocument();
  });

  it('saves changes and refreshes data on save click', async () => {
    axiosInstance.put.mockResolvedValue({ data: { success: true } });
    renderComponent();

    const editBtns = await screen.findAllByText('alertsTable.btnEdit');
    fireEvent.click(editBtns[0]);

    const saveBtn = screen.getByText('alertsTable.btnSave');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalled();
      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
    });
  });

  it('deletes an alert after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    axiosInstance.delete.mockResolvedValue({ data: { success: true } });
    
    renderComponent();

    const deleteBtns = await screen.findAllByText('alertsTable.btnDelete');
    fireEvent.click(deleteBtns[0]);

    expect(window.confirm).toHaveBeenCalledWith('alertsTable.deleteConfirm');
    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledWith('/alerts/1', expect.any(Object));
    });
  });

  it('polls for data every 10 seconds', async () => {
    renderComponent();
    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalledTimes(1));

    vi.advanceTimersByTime(10000);

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
    });
  });

  it('displays error message when fetch fails', async () => {
    axiosInstance.get.mockRejectedValue(new Error('Network Error'));
    renderComponent();
    expect(await screen.findByText('alertsTable.fetchError')).toBeInTheDocument();
  });
});