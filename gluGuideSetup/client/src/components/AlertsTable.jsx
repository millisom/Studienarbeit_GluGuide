import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/AlertsTable.module.css';

const AlertsTable = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState('');


  const [editingAlertId, setEditingAlertId] = useState(null);
  const [editedFrequency, setEditedFrequency] = useState('');
  const [editedTime, setEditedTime] = useState('');

 
  useEffect(() => {
    const fetchAlerts = async () => {
      if (!user) return;

      try {
        const userId = user.id || user.userId;
        
        const alertsResponse = await axiosInstance.get(`/alerts/${userId}`, {
          withCredentials: true,
        });
        console.log('Fetched Alerts:', alertsResponse.data);
        setAlerts(alertsResponse.data);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Failed to fetch alerts. Please try again.');
      }
    };

    fetchAlerts();
  }, [user]); 

  const refreshAlerts = async () => {
    if (!user) return;
    try {
      const userId = user.id || user.userId;
      const alertsResponse = await axiosInstance.get(`/alerts/${userId}`, { withCredentials: true });
      setAlerts(alertsResponse.data);
    } catch (err) {
      console.error('Error refreshing alerts:', err);
    }
  };

  const handleEditClick = (alert) => {
    setEditingAlertId(alert.alert_id);
    setEditedFrequency(alert.reminder_frequency);
    setEditedTime(alert.reminder_time);
  };

  const handleCancelEdit = () => {
    setEditingAlertId(null);
    setEditedFrequency('');
    setEditedTime('');
  };

  const handleSaveEdit = async (alert) => {
    try {
      const email = alert.email; 
      await axiosInstance.put(
        `/alerts/${alert.alert_id}`,
        { email, reminderFrequency: editedFrequency, reminderTime: editedTime },
        { withCredentials: true }
      );
      setEditingAlertId(null);
      setEditedFrequency('');
      setEditedTime('');
      refreshAlerts();
    } catch (error) {
      console.error('Error updating alert:', error);
      setError('Failed to update alert.');
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;
    try {
      await axiosInstance.delete(`/alerts/${alertId}`, { withCredentials: true });
      refreshAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      setError('Failed to delete alert.');
    }
  };

  return (
    <div className={styles.alertsTableContainer}>
      <h2 className={styles.tableHeader}>Your Alerts</h2>
      {error ? (
        <p className={styles.errorMessage}>{error}</p>
      ) : (
        <table className={styles.alertsTable}>
          <thead>
            <tr>
              <th>Frequency</th>
              <th>Time</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <tr key={alert.alert_id}>
                  {editingAlertId === alert.alert_id ? (
                    <>
                      <td>
                        <select
                          value={editedFrequency}
                          onChange={(e) => setEditedFrequency(e.target.value)}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="time"
                          value={editedTime}
                          onChange={(e) => setEditedTime(e.target.value)}
                        />
                      </td>
                      <td>{new Date(alert.created_at).toLocaleString()}</td>
                      <td>
                        <button onClick={() => handleSaveEdit(alert)} className={styles.saveButton}>
                          Save
                        </button>
                        <button onClick={handleCancelEdit} className={styles.cancelButton}>
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{alert.reminder_frequency}</td>
                      <td>{alert.reminder_time}</td>
                      <td>{new Date(alert.created_at).toLocaleString()}</td>
                      <td>
                        <button onClick={() => handleEditClick(alert)} className={styles.editButton}>
                          Edit
                        </button>
                        <button 
                            onClick={() => handleDeleteAlert(alert.alert_id)} 
                            className={styles.deleteButton}
                            style={{ marginLeft: '8px' }}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No alerts found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AlertsTable;