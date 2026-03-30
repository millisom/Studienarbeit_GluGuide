import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/BlogCard.module.css';
import { useAuth } from '../context/AuthContext'; 
import { useTranslation } from 'react-i18next';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await logout();
      alert(t('logout.success'));
      navigate('/'); 
    } catch (error) {
      console.error('Error logging out:', error);
      alert(t('logout.error'));
    }
  };

  return (
    <button className={styles.squareButton} onClick={handleLogout}>
      {t('logout.button')}
    </button>
  );
};

export default Logout;