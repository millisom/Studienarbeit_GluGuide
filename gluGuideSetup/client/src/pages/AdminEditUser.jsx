import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from '../styles/Admin.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faSave,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminEditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [user, setUser] = useState({
    username: '',
    email: '',
    is_admin: false,
    profile_bio: '',
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${id}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(t('adminEditUser.errorFetch'));
      }
      const data = await res.json();
      setUser({
        username: data.username || '',
        email: data.email || '',
        is_admin: data.is_admin || false,
        profile_bio: data.profile_bio || '',
      });
    } catch (err) {
      console.error(err);
      setMessage(t('adminEditUser.errorFetch'));
    }
  };

  const fetchUserAvatar = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${id}/avatar`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('adminEditUser.errorFetchAvatar'));
      }

      setAvatarUrl(data.url || '');
    } catch (err) {
      console.error('Error fetching user avatar:', err);
      setAvatarUrl('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUserData().then(() => {
      fetchUserAvatar();
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const bodyData = { ...user };
    if (newPassword.trim()) {
      bodyData.newPassword = newPassword;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t('adminEditUser.errorGeneric'));
      }

      setMessage(t('adminEditUser.successUpdate'));
      setTimeout(() => navigate('/admin'), 1500);
    } catch (error) {
      setMessage(t('adminEditUser.errorUpdate', { message: error.message }));
    }
  };

  const handleRemoveAvatar = async () => {
    if (
      !window.confirm(t('adminEditUser.confirmRemoveAvatar'))
    ) {
      return;
    }
    setMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${id}/avatar`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('adminEditUser.errorRemoveAvatar'));
      }

      setAvatarUrl('');
      setMessage(t('adminEditUser.successRemoveAvatar'));
    } catch (err) {
      setMessage(err.message || t('adminEditUser.errorRemoveAvatar'));
    }
  };

  if (loading) {
    return <p className={styles.loading}>{t('adminEditUser.loading')}</p>;
  }

  return (
    <div className={styles.formAdminCreate}>
      <h1 className={styles.title}>{t('adminEditUser.title')}</h1>
      <br />
      <form onSubmit={handleSubmit}>
        <div className={styles.inputField}>
          <label className={styles.label}>{t('adminEditUser.labelUsername')}</label>
          <input
            type='text'
            className={styles.input}
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            required
          />
        </div>

        <div className={styles.inputField}>
          <label className={styles.label}>{t('adminEditUser.labelEmail')}</label>
          <input
            type='email'
            className={styles.input}
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            required
          />
        </div>

        <div className={styles.inputField}>
          <label className={styles.labelCheckbox}>
            <input
              type='checkbox'
              checked={user.is_admin}
              onChange={(e) => setUser({ ...user, is_admin: e.target.checked })}
              className={styles.iconSpacing}
            />
            {t('adminEditUser.labelAdmin')}
          </label>
        </div>

        <div className={styles.inputField}>
          <label className={styles.label}>{t('adminEditUser.labelBio')}</label>
          <ReactQuill
            value={user.profile_bio}
            onChange={(value) => setUser({ ...user, profile_bio: value })}
            theme='snow'
            className={styles.input}
          />
        </div>

        <div className={styles.inputField}>
          <label className={styles.label}>{t('adminEditUser.labelPassword')}</label>
          <input
            type='password'
            className={styles.input}
            placeholder={t('adminEditUser.passwordPlaceholder')}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className={styles.inputField}>
          <label className={styles.label}>{t('adminEditUser.labelAvatar')}</label>
          {avatarUrl ? (
            <div className={styles.avatarPreview}>
              <img
                src={avatarUrl}
                alt='User avatar'
                className={styles.avatarImage}
              />
            </div>
          ) : (
            <p>{t('adminEditUser.noAvatar')}</p>
          )}
          <button
            type='button'
            className={styles.deleteButton}
            onClick={handleRemoveAvatar}
            disabled={!avatarUrl}
          >
            <FontAwesomeIcon icon={faTrash} className={styles.iconSpacing} />
            {t('adminEditUser.btnRemoveAvatar')}
          </button>
        </div>

        {message && (
          <p
            className={styles.message}
            style={{
              color: (message === t('adminEditUser.successUpdate') || message === t('adminEditUser.successRemoveAvatar')) ? 'green' : 'red',
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
            {t('adminEditUser.btnBack')}
          </button>
          <button type='submit' className={styles.primaryButton}>
            <FontAwesomeIcon icon={faSave} className={styles.iconSpacing} />
            {t('adminEditUser.btnUpdate')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditUser;