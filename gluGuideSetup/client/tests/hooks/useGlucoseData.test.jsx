import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from '../../src/api/axiosConfig';
import { useGlucoseData } from '../../src/hooks/useGlucoseData';

vi.mock('../../src/api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('useGlucoseData Hook', () => {
  const mockLogs = [
    { id: 1, level: 120, reading_type: 'fasting' },
    { id: 2, level: 140, reading_type: '1h_post_meal' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockLogs });
    axios.post.mockResolvedValue({ data: { success: true } });
    axios.put.mockResolvedValue({ data: { success: true } });
    axios.delete.mockResolvedValue({ data: { success: true } });
  });

  it('does not fetch when userId is null', () => {
    const { result } = renderHook(() => useGlucoseData(null));
    

    expect(axios.get).not.toHaveBeenCalled();
    expect(result.current.logs).toEqual([]);
    

  });

  it('fetches logs when userId is provided', async () => {
    const { result } = renderHook(() => useGlucoseData(42));
    
    // Hier warten wir, bis der Ladevorgang beendet ist
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    expect(axios.get).toHaveBeenCalledWith('/glucose/42', expect.objectContaining({
      params: { filter: '24hours' },
      withCredentials: true,
    }));
    expect(result.current.logs).toEqual(mockLogs);
    expect(result.current.error).toBe('');
  });

  it('returns empty logs on 404 response without error', async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 404 } });
    const { result } = renderHook(() => useGlucoseData(42));
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.logs).toEqual([]);
    expect(result.current.error).toBe('');
  });

  it('sets error on non-404 fetch failure', async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 500 } });
    const { result } = renderHook(() => useGlucoseData(42));
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch glucose logs.');
  });

  it('adds a log and returns true on success', async () => {
    const { result } = renderHook(() => useGlucoseData(42));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let returnVal;
    await act(async () => {
      returnVal = await result.current.addLog({ level: 100 });
    });

    expect(returnVal).toBe(true);
    expect(axios.post).toHaveBeenCalledWith('/glucose/log', { level: 100 }, { withCredentials: true });
    expect(result.current.successMessage).toBe('Log added!');
  });

  it('returns false and sets error when addLog fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useGlucoseData(42));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let returnVal;
    await act(async () => {
      returnVal = await result.current.addLog({ level: 100 });
    });

    expect(returnVal).toBe(false);
    expect(result.current.error).toBe('Failed to add log.');
  });

  it('deletes a log and removes it from state', async () => {
    const { result } = renderHook(() => useGlucoseData(42));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteLog(1);
    });

    expect(axios.delete).toHaveBeenCalledWith('/glucose/log/1', { withCredentials: true });
    expect(result.current.logs).toHaveLength(1);
    expect(result.current.successMessage).toBe('Log deleted!');
  });

  it('refetches when filter changes', async () => {
    const { result } = renderHook(() => useGlucoseData(42));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setFilter('7days');
    });


    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith('/glucose/42', expect.objectContaining({
        params: { filter: '7days' },
      }))
    );
  });
});