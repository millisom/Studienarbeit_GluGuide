import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthContext } from '../../src/context/AuthContext';
import axios from '../../src/api/axiosConfig';
import AlertForm from '../../src/components/AlertForm';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../src/api/axiosConfig', () => ({
  default: { post: vi.fn() },
}));

describe('AlertForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderForm = (authValue = { user: { id: 1 } }, fetchAlerts = vi.fn()) =>
    render(
      <AuthContext.Provider value={authValue}>
        <AlertForm fetchAlerts={fetchAlerts} />
      </AuthContext.Provider>
    );

  it('renders the form with all fields', () => {
    renderForm();
    expect(screen.getByText('alertForm.title')).toBeInTheDocument();
    expect(screen.getByLabelText('alertForm.frequency')).toBeInTheDocument();
    expect(screen.getByLabelText('alertForm.deliveryMethod')).toBeInTheDocument();
    expect(screen.getByLabelText('alertForm.time')).toBeInTheDocument();
    expect(screen.getByLabelText('alertForm.customMessage')).toBeInTheDocument();
  });

  it('submits form data with correct payload on success', async () => {
    axios.post.mockResolvedValue({ data: { message: 'Saved!' } });
    const fetchAlerts = vi.fn();
    const { container } = renderForm({ user: { id: 1 } }, fetchAlerts);
    const form = container.querySelector('form');
    if (form) form.noValidate = true;

    fireEvent.change(screen.getByLabelText('alertForm.frequency'), {
      target: { value: 'daily' },
    });
    fireEvent.change(screen.getByLabelText('alertForm.time'), {
      target: { value: '09:00' },
    });
    fireEvent.change(screen.getByLabelText('alertForm.customMessage'), {
      target: { value: 'Drink water' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /alertForm\.saveBtn/i }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/alerts',
        expect.objectContaining({
          reminderFrequency: 'daily',
          reminderTime: '09:00',
          notificationMethod: 'app',
          customMessage: 'Drink water',
        }),
        { withCredentials: true }
      );
      expect(screen.getByText('Saved!')).toBeInTheDocument();
      expect(fetchAlerts).toHaveBeenCalled();
    });
  });

  it('shows error and does not call backend when user is not logged in', async () => {
    const { container } = renderForm({ user: null });
    const form = container.querySelector('form');
    if (form) form.noValidate = true;

    fireEvent.change(screen.getByLabelText('alertForm.time'), {
      target: { value: '10:00' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /alertForm\.saveBtn/i }));
    });

    expect(axios.post).not.toHaveBeenCalled();
    expect(screen.getByText('alertForm.errorLogin')).toBeInTheDocument();
  });

  it('shows error message on failed submission', async () => {
    axios.post.mockRejectedValue(new Error('fail'));
    const { container } = renderForm();
    const form = container.querySelector('form');
    if (form) form.noValidate = true;

    fireEvent.change(screen.getByLabelText('alertForm.time'), {
      target: { value: '08:00' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /alertForm\.saveBtn/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('alertForm.errorSave')).toBeInTheDocument();
    });
  });
});
