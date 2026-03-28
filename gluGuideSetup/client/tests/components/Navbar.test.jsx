import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import Navbar from '../../src/components/Navbar';
import axiosInstance from '../../src/api/axiosConfig';
import { toast } from 'react-toastify';


vi.mock('../../src/api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn()
  }
}));


vi.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn()
  }
}));


const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Navbar Component - Smart Notifications', () => {
  const mockAuthValue = {
    user: { id: 69, username: 'testuser' },
    isAdmin: false,
    logout: vi.fn()
  };

  const renderNavbar = () => {
    return render(
      <AuthContext.Provider value={mockAuthValue}>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.useFakeTimers(); 
  });

  afterEach(() => {

    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('fetches notifications and displays toast popup on load', async () => {

    axiosInstance.get.mockImplementation((url) => {
      if (url.includes('/alerts/')) {
        return Promise.resolve({ data: [{ id: 1 }] }); 
      }
      if (url.includes('/notifications/unread')) {
        return Promise.resolve({
          data: [{ id: 99, title: 'Sugar Log Reminder', message: 'Time to log!' }]
        });
      }
      return Promise.resolve({ data: [] });
    });
    
    axiosInstance.put.mockResolvedValue({});

    renderNavbar();


    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith('/alerts/69');
      expect(axiosInstance.get).toHaveBeenCalledWith('/notifications/unread');
    });


    await waitFor(() => {
      expect(toast.info).toHaveBeenCalled();
    });


    expect(axiosInstance.put).toHaveBeenCalledWith('/notifications/99/read');
  });

  it('polls every 10 seconds when the user has active alerts (Fast Mode)', async () => {
    axiosInstance.get.mockImplementation((url) => {
      if (url.includes('/alerts/')) return Promise.resolve({ data: [{ id: 1 }] });
      return Promise.resolve({ data: [] });
    });

    renderNavbar();


    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalledWith('/notifications/unread'));
    

    axiosInstance.get.mockClear();


    act(() => {
      vi.advanceTimersByTime(10000);
    });


    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith('/notifications/unread');
    });
  });

  it('polls every 5 minutes when the user has NO active alerts (Eco Mode)', async () => {

    axiosInstance.get.mockImplementation((url) => {
      if (url.includes('/alerts/')) return Promise.resolve({ data: [] }); 
      return Promise.resolve({ data: [] });
    });

    renderNavbar();

    // Wait for initial load
    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalledWith('/notifications/unread'));
    axiosInstance.get.mockClear();


    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(axiosInstance.get).not.toHaveBeenCalledWith('/notifications/unread');


    act(() => {
      vi.advanceTimersByTime(300000); 
    });

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith('/notifications/unread');
    });
  });
});