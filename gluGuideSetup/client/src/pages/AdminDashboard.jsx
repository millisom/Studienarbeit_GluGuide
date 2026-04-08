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
// WICHTIG: Importiere deine axiosInstance
import axiosInstance from '../api/axiosConfig'; 

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Umstellung auf axiosInstance für die Sitzungssicherheit
  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error("Fehler beim Laden der Benutzer:", err);
      throw new Error(t('adminDashboard.errorFetch'));
    }
  };

  const fetchArticles = async () => {
    try {
      const response = await axiosInstance.get('/admin/knowledge');
      setArticles(response.data);
    } catch (err) {
      console.error("Fehler beim Laden der Artikel:", err);
      throw new Error(t('adminDashboard.errorFetch'));
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        // Lädt beide Ressourcen gleichzeitig mit den korrekten Anmeldedaten
        await Promise.all([fetchUsers(), fetchArticles()]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [t]);

  const handleDeleteUser = async (id) => {
    if (window.confirm(t('adminDashboard.confirmDelete'))) {
      try {
        const response = await axiosInstance.delete(`/admin/user/${id}`);
        setMessage(response.data.message);
        fetchUsers();
      } catch (err) {
        setMessage(err.response?.data?.error || t('adminDashboard.errorDelete'));
      }
    }
  };

  const handleDeleteArticle = async (id) => {
    if (window.confirm(t('viewBlogEntries.confirmDelete'))) {
      try {
        const response = await axiosInstance.delete(`/admin/knowledge/${id}`);
        setMessage(t('viewBlogEntries.deleteSuccess') || "Artikel gelöscht");
        fetchArticles();
      } catch (err) {
        setMessage(err.response?.data?.error || t('viewBlogEntries.deleteError'));
      }
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
              <button className={styles.squareButton} onClick={() => navigate('/admin/createKnowledge')}>
                <FontAwesomeIcon icon={faPlus} className={styles.iconSpacing} />
                {t('knowledge.btnCreate') || "Artikel erstellen"}
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
                <th>Kategorie</th>
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
                  <td>{i18n.language === 'de' ? article.category_de : article.category_en}</td>
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