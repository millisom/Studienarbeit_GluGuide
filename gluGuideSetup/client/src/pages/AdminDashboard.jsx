import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
  faEdit,
  faTrash,
  faCheck,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Admin.module.css';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchUsers = () => {
    fetch(`${API_BASE_URL}/admin/users`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(t('adminDashboard.errorFetch'));
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm(t('adminDashboard.confirmDelete'))) {
      fetch(`${API_BASE_URL}/admin/user/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || t('adminDashboard.errorDelete'));
          }
          return data;
        })
        .then((data) => {
          setMessage(data.message);
          fetchUsers();
        })
        .catch((err) => {
          setMessage(err.message || t('adminDashboard.errorDelete'));
        });
    }
  };

  if (loading) return <p className={styles.loading}>{t('adminDashboard.loading')}</p>;
  if (error) return <p className={styles.error}>{t('adminDashboard.errorGeneral', { error })}</p>;

  return (
    <div className={styles.adminArea}>
      <div className={styles.adminContainer}>
        <section className={styles.card}>
          <div className={styles.cardBody}>
            <h2 className={styles.title}>{t('adminDashboard.titleDashboard')}</h2>
            <p className={styles.infoText}>
              {t('adminDashboard.welcomeText')}
            </p>
            <button
              className={styles.squareButton}
              onClick={() => navigate('/admin/createUser')}
            >
              <FontAwesomeIcon
                icon={faUserPlus}
                className={styles.iconSpacing}
              />
              {t('adminDashboard.btnCreateUser')}
            </button>
          </div>
        </section>
      </div>

      <section className={styles.card}>
        <div className={styles.cardBody}>
          <h2 className={styles.title}>{t('adminDashboard.titleUserManagement')}</h2>
          {message && <p className={styles.successMessage}>{message}</p>}
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>{t('adminDashboard.tableId')}</th>
                <th>{t('adminDashboard.tableUsername')}</th>
                <th>{t('adminDashboard.tableEmail')}</th>
                <th>{t('adminDashboard.tableCreatedAt')}</th>
                <th>{t('adminDashboard.tableAdmin')}</th>
                <th>{t('adminDashboard.tableActions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.created_at).toLocaleString(i18n.language)}</td>
                  <td>
                    {user.is_admin ? (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className={styles.positiveIcon}
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faXmark}
                        className={styles.negativeIcon}
                      />
                    )}
                  </td>
                  <td>
                    <button
                      className={styles.editButton}
                      onClick={() => navigate(`/admin/editUser/${user.id}`)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> {t('adminDashboard.btnEdit')}
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(user.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} /> {t('adminDashboard.btnDelete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;