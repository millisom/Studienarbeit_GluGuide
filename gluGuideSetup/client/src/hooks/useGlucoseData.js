import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';

export const useGlucoseData = (userId) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('24hours');
  const [successMessage, setSuccessMessage] = useState('');

 
  useEffect(() => {
    if (!userId) return;

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/glucose/${userId}`, {
          params: { filter },
          withCredentials: true,
        });
        setLogs(response.data);
        setError('');
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setLogs([]);
          setError('');
        } else {
          setError('Failed to fetch glucose logs.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [userId, filter]);


  const addLog = async (data) => {
    try {
      await axiosInstance.post('/glucose/log', data, { withCredentials: true });
      setSuccessMessage('Glucose log added successfully!');
      setError('');
      return true;
    } catch {
      setError('Failed to add glucose log.');
      return false;
    }
  };

  const deleteLog = async (logId) => {
    try {
      await axiosInstance.delete(`/glucose/log/${logId}`, { withCredentials: true });
      setLogs((prev) => prev.filter((log) => log.id !== logId));
      setSuccessMessage('Glucose log deleted successfully!');
      return true;
    } catch {
      setError('Failed to delete glucose log.');
      return false;
    }
  };

  const updateLog = async (logId, updatedData) => {
    try {
      await axiosInstance.put(`/glucose/log/${logId}`, updatedData, { withCredentials: true });
      setLogs((prev) => prev.map((log) => (log.id === logId ? { ...log, ...updatedData } : log)));
      setSuccessMessage('Glucose log updated successfully!');
      return true;
    } catch {
      setError('Failed to update glucose log.');
      return false;
    }
  };

  return { logs, loading, error, successMessage, filter, setFilter, addLog, deleteLog, updateLog, setSuccessMessage };
};