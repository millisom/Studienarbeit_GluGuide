import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/AlertsTable.module.css';
import { useTranslation } from 'react-i18next';


const formatTime = (reminderTime) => {
  if (!reminderTime) return '';
  if (reminderTime.includes('T') || reminderTime.includes('-')) {
    const d = new Date(reminderTime);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return reminderTime.substring(0, 5);
};


const formatTimeForInput = (reminderTime) => {
  if (!reminderTime) return '';
  if (reminderTime.includes('T') || reminderTime.includes('-')) {
    const d = new Date(reminderTime);
    if (isNaN(d.getTime())) return '';
    return d.toTimeString().substring(0, 5);
  }
  return reminderTime.substring(0, 5);
};


const formatMessage = (customMessage, t) => {
  if (!customMessage) return null;
  try {
    const meta = JSON.parse(customMessage);
    if (meta.type === 'meal_reminder') {
      const typeLabel = t(`glucoseLog.types.${meta.meal_type}`, { defaultValue: meta.meal_type });
      return ` ${t('alertsTable.mealReminder', { defaultValue: 'Meal reminder' })}: ${typeLabel}`;
    }
    return customMessage;
  } catch {
    return customMessage;
  }
};


const isMealReminder = (alert) => {
  if (!alert.custom_message) return false;
  try {
    const meta = JSON.parse(alert.custom_message);
    return meta.type === 'meal_reminder';
  } catch {
    return false;
  }
};

const AlertsTable = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
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
      setError(t('alertsTable.fetchError'));
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
    setEditedTime(formatTimeForInput(alert.reminder_time));
    setEditedMethod(alert.notification_method || 'app');
    setEditedMessage(isMealReminder(alert) ? '' : (alert.custom_message || ''));
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
      setError(t('alertsTable.updateError'));
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm(t('alertsTable.deleteConfirm'))) return;
    try {
      await axiosInstance.delete(`/alerts/${alertId}`, { withCredentials: true });
      refreshAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error.message);
      setError(t('alertsTable.deleteError'));
    }
  };

  return (
    <div className={styles.alertsTableContainer}>
      <h2 className={styles.tableHeader}>{t('alertsTable.header')}</h2>
      {error ? (
        <p className={styles.errorMessage}>{error}</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.alertsTable}>
            <thead>
              <tr>
                <th>{t('alertsTable.colFreq')}</th>
                <th>{t('alertsTable.colMethod')}</th>
                <th>{t('alertsTable.colTime')}</th>
                <th>{t('alertsTable.colMsg')}</th>
                <th>{t('alertsTable.colActions')}</th>
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
                            <option value="once">{t('alertForm.freqOnce')}</option>
                            <option value="daily">{t('alertForm.freqDaily')}</option>
                            <option value="weekly">{t('alertForm.freqWeekly')}</option>
                          </select>
                        </td>
                        <td>
                          <select value={editedMethod} onChange={(e) => setEditedMethod(e.target.value)}>
                            <option value="app">{t('alertsTable.methodApp')}</option>
                            <option value="email">{t('alertsTable.methodEmail')}</option>
                          </select>
                        </td>
                        <td>
                          <input type="time" value={editedTime} onChange={(e) => setEditedTime(e.target.value)} />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            value={editedMessage} 
                            placeholder={t('alertsTable.placeholderStandard')}
                            onChange={(e) => setEditedMessage(e.target.value)} 
                            style={{ width: '100%' }}
                          />
                        </td>
                        <td style={{ minWidth: '130px' }}>
                          <button onClick={() => handleSaveEdit(alert)} className={styles.saveButton}>{t('alertsTable.btnSave')}</button>
                          <button onClick={handleCancelEdit} className={styles.cancelButton} style={{ marginLeft: '4px' }}>{t('alertsTable.btnCancel')}</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ textTransform: 'capitalize' }}>
                          {t(`alertForm.freq${alert.reminder_frequency.charAt(0).toUpperCase() + alert.reminder_frequency.slice(1)}`)}
                        </td>
                        <td>{alert.notification_method === 'app' ? t('alertsTable.methodApp') : t('alertsTable.methodEmail')}</td>
                        <td>{formatTime(alert.reminder_time)}</td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {formatMessage(alert.custom_message, t) || <span style={{ color: '#888', fontStyle: 'italic' }}>{t('alertsTable.statusStandard')}</span>}
                        </td>
                        <td style={{ minWidth: '130px' }}>
                          <button onClick={() => handleEditClick(alert)} className={styles.editButton}>{t('alertsTable.btnEdit')}</button>
                          <button onClick={() => handleDeleteAlert(alert.alert_id)} className={styles.deleteButton} style={{ marginLeft: '4px' }}>{t('alertsTable.btnDelete')}</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>{t('alertsTable.noAlerts')}</td>
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
