import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosConfig';

export const useGlucoseData = (userId) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('24hours');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchLogs = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/glucose/${userId}`, {
        params: { filter },
        withCredentials: true,
      });
      setLogs(response.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setLogs([]);
      } else {
        setError('Failed to fetch glucose logs.');
      }
    } finally {
      setLoading(false);
    }
  }, [userId, filter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addLog = async (data) => {
    try {
      await axiosInstance.post('/glucose/log', data, { withCredentials: true });
      setSuccessMessage('Log added!');
      await fetchLogs();
      return true;
    } catch {
      setError('Failed to add log.');
      return false;
    }
  };

  const deleteLog = async (logId) => {
    try {
      await axiosInstance.delete(`/glucose/log/${logId}`, { withCredentials: true });
      setLogs((prev) => prev.filter((log) => log.id !== logId));
      setSuccessMessage('Log deleted!');
      return true;
    } catch {
      setError('Failed to delete.');
      return false;
    }
  };

  const updateLog = async (logId, updatedData) => {
  try {
    await axiosInstance.put(`/glucose/log/${logId}`, updatedData, { withCredentials: true });
    
    await fetchLogs(); 
    
    setSuccessMessage('Update successful!');
    return true;
  } catch (error) {
    console.error("Update Hook Error:", error);
    setError('Update failed.');
    return false;
  }
};

  return { logs, loading, error, successMessage, filter, setFilter, addLog, deleteLog, updateLog, setSuccessMessage };
};