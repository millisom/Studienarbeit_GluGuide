import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import styles from '../styles/LoginForm.module.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';  
import { useTranslation } from 'react-i18next';

const ForgotPasswordForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    if (user) {
      navigate('/blogs'); 
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setNotification({ message: '', type: '' });

    try {
      const response = await axiosInstance.post('/forgotPassword', { email });
      setNotification({ message: response.data.message, type: 'success' });
      if (response.data.success) {
          setEmail('');
      }
    } catch (error) {
      setNotification({
        message: error.response?.data?.message || t('forgotPassword.errorFallback'),
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <p className={styles.pageDescription}>
        {t('forgotPassword.description')}
      </p>
      <form onSubmit={handleSubmit} className={styles.formLogIn}>
      <h1 className={styles.pageTitle}>{t('forgotPassword.title')}</h1>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder={t('forgotPassword.placeholder')}
          className={`${styles.input} ${styles.mt}`}
        />
        <div className={styles.buttonGroup}>
          <button type="submit" disabled={isLoading} className={`${styles.button} ${styles.mt}`}>
            {isLoading ? t('forgotPassword.btnSending') : t('forgotPassword.btnSend')}
          </button>
        </div>
      </form>
      {notification.message && (
        <p
          className={
            notification.type === 'error' ? styles.errorMessage : styles.successMessage
          }
        >
          {notification.message}
        </p>
      )}
    </div>
  );
};

export default ForgotPasswordForm;