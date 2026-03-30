import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/AlertForm.module.css';
import { useTranslation } from 'react-i18next'; 

const AlertForm = ({ fetchAlerts }) => {
  const { user } = useAuth(); 
  const { t } = useTranslation(); 

  const [reminderFrequency, setReminderFrequency] = useState('once');
  const [reminderTime, setReminderTime] = useState('');
  const [notificationMethod, setNotificationMethod] = useState('app');
  const [customMessage, setCustomMessage] = useState(''); 
  
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
    if (!user) return setError(t('alertForm.errorLogin')); 

    try {
      const response = await axiosInstance.post('/alerts', {
        reminderFrequency,
        reminderTime,
        notificationMethod,
        customMessage 
      }, { withCredentials: true });

      setSuccessMessage(response.data.message || t('alertForm.successSave')); 
      setError('');
      
      setReminderFrequency('once'); 
      setReminderTime(''); 
      setNotificationMethod('app');
      setCustomMessage('');

      if (fetchAlerts) fetchAlerts();

    } catch (err) {
      console.error('Error setting alert preferences:', err);
      setError(t('alertForm.errorSave')); 
      setSuccessMessage(''); 
    }
  };

  return (
    <div className={styles.alertFormContainer}>
      <h2 className={styles.alertFormTitle}>{t('alertForm.title')}</h2>
      <form onSubmit={handleSubmit}>
        
        <div className={styles.alertFormField}>
          <label htmlFor="reminderFrequency" className={styles.alertFormLabel}>
            {t('alertForm.frequency')}
          </label>
          <select id="reminderFrequency" value={reminderFrequency} onChange={(e) => setReminderFrequency(e.target.value)} className={styles.alertFormSelect}>
            <option value="once">{t('alertForm.freqOnce')}</option> 
            <option value="daily">{t('alertForm.freqDaily')}</option>
            <option value="weekly">{t('alertForm.freqWeekly')}</option>
          </select>
        </div>

        <div className={styles.alertFormField}>
          <label htmlFor="notificationMethod" className={styles.alertFormLabel}>
            {t('alertForm.deliveryMethod')}
          </label>
          <select id="notificationMethod" value={notificationMethod} onChange={(e) => setNotificationMethod(e.target.value)} className={styles.alertFormSelect}>
            <option value="app">{t('alertForm.methodApp')}</option>
            <option value="email">{t('alertForm.methodEmail')}</option>
          </select>
        </div>

        <div className={styles.alertFormField}>
          <label htmlFor="reminderTime" className={styles.alertFormLabel}>
            {t('alertForm.time')}
          </label>
          <input type="time" id="reminderTime" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className={styles.alertFormInput} required />
        </div>

        <div className={styles.alertFormField}>
          <label htmlFor="customMessage" className={styles.alertFormLabel}>
            {t('alertForm.customMessage')}
          </label>
          <textarea 
            id="customMessage" 
            value={customMessage} 
            onChange={(e) => setCustomMessage(e.target.value)} 
            className={styles.alertFormInput} 
            placeholder={t('alertForm.placeholder')}
            rows="2"
            style={{ resize: 'vertical' }}
          />
        </div>

        <button type="submit" className={styles.alertFormButton}>
          {t('alertForm.saveBtn')}
        </button>
      </form>

      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
      {error && <p className={styles.errorMessage || styles.error}>{error}</p>} 
    </div>
  );
};

export default AlertForm;