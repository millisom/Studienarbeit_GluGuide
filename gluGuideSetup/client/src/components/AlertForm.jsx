import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/AlertForm.module.css';

const AlertForm = ({ fetchAlerts }) => {
  const { user } = useAuth(); 

  // 1. CHANGED DEFAULT TO 'once'
  const [reminderFrequency, setReminderFrequency] = useState('once');
  const [reminderTime, setReminderTime] = useState('');
  const [notificationMethod, setNotificationMethod] = useState('app');
  const [customMessage, setCustomMessage] = useState(''); // NEW STATE
  
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 10000);
      return () => clearTimeout(timer); 
    }
  }, [successMessage]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return setError('You must be logged in to set alerts.');

    try {
      const response = await axiosInstance.post('/alerts', {
        reminderFrequency,
        reminderTime,
        notificationMethod,
        customMessage // NEW: Send custom message
      }, { withCredentials: true });

      setSuccessMessage(response.data.message || 'Alert preferences saved!');
      setError('');
      
      // Reset form back to defaults
      setReminderFrequency('once'); 
      setReminderTime(''); 
      setNotificationMethod('app');
      setCustomMessage('');

      if (fetchAlerts) fetchAlerts();

    } catch (err) {
      console.error('Error setting alert preferences:', err);
      setError('Failed to save alert preferences.');
      setSuccessMessage(''); 
    }
  };

  return (
    <div className={styles.alertFormContainer}>
      <h2 className={styles.alertFormTitle}>Set Reminder Alerts</h2>
      <form onSubmit={handleSubmit}>
        
        <div className={styles.alertFormField}>
          <label htmlFor="reminderFrequency" className={styles.alertFormLabel}>Frequency:</label>
          <select id="reminderFrequency" value={reminderFrequency} onChange={(e) => setReminderFrequency(e.target.value)} className={styles.alertFormSelect}>
            <option value="once">Once</option> 
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <div className={styles.alertFormField}>
          <label htmlFor="notificationMethod" className={styles.alertFormLabel}>Delivery Method:</label>
          <select id="notificationMethod" value={notificationMethod} onChange={(e) => setNotificationMethod(e.target.value)} className={styles.alertFormSelect}>
            <option value="app">In-App Popup</option>
            <option value="email">Email</option>
          </select>
        </div>

        <div className={styles.alertFormField}>
          <label htmlFor="reminderTime" className={styles.alertFormLabel}>Time:</label>
          <input type="time" id="reminderTime" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className={styles.alertFormInput} required />
        </div>

        {/* NEW CUSTOM MESSAGE INPUT */}
        <div className={styles.alertFormField}>
          <label htmlFor="customMessage" className={styles.alertFormLabel}>Custom Message (Optional):</label>
          <textarea 
            id="customMessage" 
            value={customMessage} 
            onChange={(e) => setCustomMessage(e.target.value)} 
            className={styles.alertFormInput} 
            placeholder="Leave blank for standard message"
            rows="2"
            style={{ resize: 'vertical' }}
          />
        </div>

        <button type="submit" className={styles.alertFormButton}>Save Preferences</button>
      </form>

      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
      {error && <p className={styles.errorMessage || styles.error}>{error}</p>} 
    </div>
  );
};

export default AlertForm;