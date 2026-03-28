import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/AlertsTable.module.css';


const AlertsTable = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState('');


  const [editingAlertId, setEditingAlertId] = useState(null);
  const [editedFrequency, setEditedFrequency] = useState('');
  const [editedTime, setEditedTime] = useState('');
  const [editedMethod, setEditedMethod] = useState('');
  const [editedMessage, setEditedMessage] = useState('');

  const fetchAlerts = async () => {
    if (!user) return;
    try {
      const userId = user.id || user.userId;
      const response = await axiosInstance.get(`/alerts/${userId}`, {
        withCredentials: true,
      });

      const sortedByCreation = response.data.sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );

      setAlerts(sortedByCreation);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to fetch alerts.');
    }
  };


  useEffect(() => {

    fetchAlerts();


    const intervalId = setInterval(() => {
      fetchAlerts();
    }, 10000);


    return () => clearInterval(intervalId);
  }, [user, refreshTrigger]); 

  const refreshAlerts = () => fetchAlerts();

  const handleEditClick = (alert) => {
    setEditingAlertId(alert.alert_id);
    setEditedFrequency(alert.reminder_frequency);
    setEditedTime(alert.reminder_time);
    setEditedMethod(alert.notification_method || 'app');
    setEditedMessage(alert.custom_message || '');
  };

  const handleCancelEdit = () => {
    setEditingAlertId(null);
  };

  const handleSaveEdit = async (alert) => {
    try {
      await axiosInstance.put(
        `/alerts/${alert.alert_id}`,
        { 
            reminderFrequency: editedFrequency, 
            reminderTime: editedTime,
            notificationMethod: editedMethod,
            customMessage: editedMessage
        },
        { withCredentials: true }
      );
      setEditingAlertId(null);
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
      console.error('Error deleting alert:', error.message);
      setError('Failed to delete alert.');
    }
  };

  return (
    <div className={styles.alertsTableContainer}>
      <h2 className={styles.tableHeader}>Your Alerts</h2>
      {error ? (
        <p className={styles.errorMessage}>{error}</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.alertsTable}>
            <thead>
              <tr>
                <th>Frequency</th>
                <th>Method</th>
                <th>Time</th>
                <th>Message</th>
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
                          <select value={editedFrequency} onChange={(e) => setEditedFrequency(e.target.value)}>
                            <option value="once">Once</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                          </select>
                        </td>
                        <td>
                          <select value={editedMethod} onChange={(e) => setEditedMethod(e.target.value)}>
                            <option value="app">App Popup</option>
                            <option value="email">Email</option>
                          </select>
                        </td>
                        <td>
                          <input type="time" value={editedTime} onChange={(e) => setEditedTime(e.target.value)} />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            value={editedMessage} 
                            placeholder="Standard message"
                            onChange={(e) => setEditedMessage(e.target.value)} 
                            style={{ width: '100%' }}
                          />
                        </td>
                        <td style={{ minWidth: '130px' }}>
                          <button onClick={() => handleSaveEdit(alert)} className={styles.saveButton}>Save</button>
                          <button onClick={handleCancelEdit} className={styles.cancelButton} style={{ marginLeft: '4px' }}>Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ textTransform: 'capitalize' }}>{alert.reminder_frequency}</td>
                        <td>{alert.notification_method === 'app' ? 'App' : 'Email'}</td>
                        <td>{alert.reminder_time ? alert.reminder_time.substring(0, 5) : ''}</td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {alert.custom_message || <span style={{ color: '#888', fontStyle: 'italic' }}>Standard</span>}
                        </td>
                        <td style={{ minWidth: '130px' }}>
                          <button onClick={() => handleEditClick(alert)} className={styles.editButton}>Edit</button>
                          <button onClick={() => handleDeleteAlert(alert.alert_id)} className={styles.deleteButton} style={{ marginLeft: '4px' }}>Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No alerts found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AlertsTable;