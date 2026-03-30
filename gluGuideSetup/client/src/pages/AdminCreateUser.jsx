import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../api/axiosConfig';
import styles from '../styles/Admin.module.css';
import { useTranslation } from 'react-i18next';

const AdminCreateUser = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      setMessage(t('adminCreateUser.errorTerms'));
      return;
    }

    try {
      const res = await axiosInstance.post(
        '/createUser',
        { username, email, password, termsAccepted, is_admin: isAdmin },
        { withCredentials: true }
      );

      setMessage(t('adminCreateUser.successMessage', { username: res.data.username }));
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || t('adminCreateUser.errorFallback'));
    }
  };

  return (
    <div className={styles.formAdminCreate}>
      <h1 className={styles.title}>{t('adminCreateUser.title')}</h1>
      <br />
      <form onSubmit={handleSubmit}>
        <div className={styles.inputField}>
          <label className={styles.label}>{t('adminCreateUser.labelUsername')}</label>
          <input
            type='text'
            className={styles.input}
            placeholder={t('adminCreateUser.placeholderUsername')}
            value={username}
            required
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className={styles.inputField}>
          <label className={styles.label}>{t('adminCreateUser.labelEmail')}</label>
          <input
            type='email'
            className={styles.input}
            placeholder={t('adminCreateUser.placeholderEmail')}
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.inputField}>
          <label className={styles.label}>{t('adminCreateUser.labelPassword')}</label>
          <input
            type='password'
            className={styles.input}
            placeholder={t('adminCreateUser.placeholderPassword')}
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <label className={styles.labelCheckbox}>
          <input
            type='checkbox'
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className={styles.iconSpacing}
          />
          {t('adminCreateUser.labelTerms')}
        </label>

        <label className={styles.labelCheckbox}>
          <input
            type='checkbox'
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            className={styles.iconSpacing}
          />
          {t('adminCreateUser.labelIsAdmin')}
        </label>

        {message && (
          <p
            className={styles.message}
            style={{
              color: message.includes('successfully') || message.includes('erfolgreich') ? 'green' : 'red',
            }}
          >
            {message}
          </p>
        )}

        <div className={styles.buttonGroup}>
          <button
            type='button'
            className={styles.secondaryButton}
            onClick={() => navigate('/admin')}
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              className={styles.iconSpacing}
            />
            {t('adminCreateUser.btnBack')}
          </button>
          <button type='submit' className={styles.primaryButton}>
            <FontAwesomeIcon icon={faUserPlus} className={styles.iconSpacing} />
            {t('adminCreateUser.btnCreate')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateUser;