import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
  faEdit,
  faTrash,
  faCheck,
  faXmark,
  faPlus,
  faBookOpen
} from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Admin.module.css';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchUsers = () => {
    return fetch(`${API_BASE_URL}/admin/users`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(t('adminDashboard.errorFetch'));
        return res.json();
      })
      .then((data) => setUsers(data));
  };


  const fetchArticles = () => {
    return fetch(`${API_BASE_URL}/admin/knowledge`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(t('adminDashboard.errorFetch'));
        return res.json();
      })
      .then((data) => setArticles(data));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchUsers(), fetchArticles()])
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [t]);

  const handleDeleteUser = (id) => {
    if (window.confirm(t('adminDashboard.confirmDelete'))) {
      fetch(`${API_BASE_URL}/admin/user/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || t('adminDashboard.errorDelete'));
          setMessage(data.message);
          fetchUsers();
        })
        .catch((err) => setMessage(err.message));
    }
  };


  const handleDeleteArticle = (id) => {
    if (window.confirm(t('viewBlogEntries.confirmDelete'))) {
      fetch(`${API_BASE_URL}/admin/knowledge/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(t('viewBlogEntries.deleteError'));
          setMessage(t('viewBlogEntries.deleteSuccess') || "Article Deleted");
          fetchArticles();
        })
        .catch((err) => setMessage(err.message));
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
            <p className={styles.infoText}>{t('adminDashboard.welcomeText')}</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className={styles.squareButton} onClick={() => navigate('/admin/createUser')}>
                <FontAwesomeIcon icon={faUserPlus} className={styles.iconSpacing} />
                {t('adminDashboard.btnCreateUser')}
              </button>
              {/* New Create Article Button */}
              <button className={styles.squareButton} onClick={() => navigate('/admin/createKnowledge')}>
                <FontAwesomeIcon icon={faPlus} className={styles.iconSpacing} />
                {t('knowledge.btnCreate') || "Create Article"}
              </button>
            </div>
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
                  <td>
                    <FontAwesomeIcon 
                      icon={user.is_admin ? faCheck : faXmark} 
                      className={user.is_admin ? styles.positiveIcon : styles.negativeIcon} 
                    />
                  </td>
                  <td>
                    <button className={styles.editButton} onClick={() => navigate(`/admin/editUser/${user.id}`)}>
                      <FontAwesomeIcon icon={faEdit} /> {t('adminDashboard.btnEdit')}
                    </button>
                    <button className={styles.deleteButton} onClick={() => handleDeleteUser(user.id)}>
                      <FontAwesomeIcon icon={faTrash} /> {t('adminDashboard.btnDelete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>


      <section className={styles.card} style={{ marginTop: '30px' }}>
        <div className={styles.cardBody}>
          <h2 className={styles.title}>
            <FontAwesomeIcon icon={faBookOpen} style={{ marginRight: '10px' }} />
            {t('knowledge.hubTitle')} Management
          </h2>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>{t('adminDashboard.tableId')}</th>
                <th>{t('adminEditPost.labelPostTitle')}</th>
                <th>Category</th>
                <th>{t('adminDashboard.tableActions')}</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td>{article.id}</td>
                  <td>
                    {i18n.language === 'de' ? article.title_de : article.title_en}
                  </td>
                  <td>{article.category}</td>
                  <td>
                    <button 
                      className={styles.editButton} 
                      onClick={() => navigate(`/admin/editKnowledge/${article.id}`)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> {t('adminDashboard.btnEdit')}
                    </button>
                    <button 
                      className={styles.deleteButton} 
                      onClick={() => handleDeleteArticle(article.id)}
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