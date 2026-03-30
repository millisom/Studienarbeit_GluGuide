import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/LoginForm.module.css';
import { useTranslation } from 'react-i18next';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [values, setValues] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(values);

    if (result.success) {
      navigate('/account');
    } else {
      setError(result.message || t('login.errorFallback'));
    }
    
    setIsLoading(false);
  };

  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.pageTitle}>{t('login.welcome')}</h1>
      <p className={styles.pageDescription}>
        {t('login.description')}
      </p>
      <form onSubmit={handleSubmit} className={styles.formLogIn}>
        <h1 className="pageTitle">{t('login.title')}</h1>
        <div className='inputField'>
          <input
            type="text"
            name="username"
            id="username"
            onChange={handleInput}
            required
            className={styles.input}
            placeholder={t('login.username')}
          />
        </div>
        <div className='inputField'>
          <input
            type="password"
            name="password"
            id="password"
            onChange={handleInput}
            required
            className={styles.input}
            placeholder={t('login.password')}
          />
        </div>
        <div className={`${styles.buttonGroup} ${styles.mt}`}>
          <button type="submit" disabled={isLoading} className={styles.button}>
            {isLoading ? t('login.btnLoggingIn') : t('login.btnLogin')}
          </button>
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <p className={styles.linkGroup}>
          <Link to="/forgotPassword" className={styles.link}>
            {t('login.forgot_password')}
          </Link>
          |
          <Link to="/signUp" className={styles.link}>
            {t('login.signupLink')}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;