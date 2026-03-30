import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import styles from '../styles/LoginForm.module.css';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const ResetPasswordForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/account');
    }
  }, [user, authLoading, navigate]);

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setNotification({ message: '', type: '' });

    if (newPassword !== confirmPassword) {
      setNotification({ message: t('resetPassword.errorMismatch'), type: 'error' });
      return;
    }

    if (newPassword.length < 8) {
      setNotification({ message: t('resetPassword.errorLength'), type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axiosInstance.post('/resetPassword', {
        token,
        newPassword,
      });

      setNotification({ message: response.data.message, type: 'success' });

      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (error) {
      setNotification({
        message: error.response?.data?.message || t('resetPassword.errorFallback'),
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <form onSubmit={handlePasswordReset} className={styles.formLogIn}>
        <h1 className="pageTitle">{t('resetPassword.title')}</h1>
        <div className='inputField'>
        <input
          type="password"
          name="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className={styles.input}
          placeholder={t('resetPassword.placeholderNew')}
        />
        </div>
        <div className='inputField'>
        <input
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className={styles.input}
          placeholder={t('resetPassword.placeholderConfirm')}
        />
        </div>
      <div className={styles.buttonGroup}>
        <button type="submit" disabled={isLoading} className={styles.button}>
          {isLoading ? t('resetPassword.btnResetting') : t('resetPassword.btnReset')}
        </button>
      </div>
      {notification.message && (
        <p className={notification.type === 'error' ? styles.errorMessage : styles.successMessage}>
          {notification.message}
        </p>
      )}
    </form>
  );
};

export default ResetPasswordForm;