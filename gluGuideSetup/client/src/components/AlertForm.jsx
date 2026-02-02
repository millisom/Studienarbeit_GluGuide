import { useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/AlertForm.module.css';

const AlertForm = ({ fetchAlerts }) => {
  const { user } = useAuth(); 

  const [reminderFrequency, setReminderFrequency] = useState('daily');
  const [reminderTime, setReminderTime] = useState('');
  

  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
        setError('You must be logged in to set alerts.');
        return;
    }

    try {
      const response = await axiosInstance.post('/alerts', {
        reminderFrequency,
        reminderTime,
      }, {
        withCredentials: true,
      });

      setSuccessMessage(response.data.message || 'Alert preferences saved!');
      setError('');
      
      setReminderFrequency('daily'); 
      setReminderTime(''); 

      if (fetchAlerts) {
        fetchAlerts();
      }

    } catch (err) {
      console.error('Error setting alert preferences:', err);
      setError('Failed to save alert preferences. Please try again.');
      setSuccessMessage(''); 
    }
  };

  return (
    <div className={styles.alertFormContainer}>
      <h2 className={styles.alertFormTitle}>Set Reminder Alerts</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.alertFormField}>
          <label htmlFor="reminderFrequency" className={styles.alertFormLabel}>
            Reminder Frequency:
          </label>
          <select
            id="reminderFrequency"
            value={reminderFrequency}
            onChange={(e) => setReminderFrequency(e.target.value)}
            className={styles.alertFormSelect}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <div className={styles.alertFormField}>
          <label htmlFor="reminderTime" className={styles.alertFormLabel}>
            Reminder Time:
          </label>
          <input
            type="time"
            id="reminderTime"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className={styles.alertFormInput}
            required
          />
        </div>

        <button type="submit" className={styles.alertFormButton}>
          Save Preferences
        </button>
      </form>

      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
      {error && <p className={styles.errorMessage || styles.error}>{error}</p>} 
    </div>
  );
};

export default AlertForm;