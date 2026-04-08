import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/ViewBlogEntries.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const KnowledgeBasePage = () => {
  const { t, i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/knowledge');
      setArticles(response.data);
    } catch (err) {
      console.error("Failed to load articles:", err);
      setError(t('knowledge.errorFetch') || 'Failed to load content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm(t('viewBlogEntries.confirmDelete'))) {
      try {
        await axiosInstance.delete(`/admin/knowledge/${id}`);
        fetchArticles();
      } catch (err) {
        alert(t('viewBlogEntries.deleteError'));
      }
    }
  };

  if (loading) return <p className={styles.loadingMessage}>{t('knowledge.loading') || 'Loading...'}</p>;

  return (
    <div className={styles.viewBlogEntries}>
      <h1 className={styles.title}>{t('knowledge.hubTitle')}</h1>
      <p className={styles.noPostsFound} style={{ marginBottom: '30px', fontStyle: 'normal' }}>
        {t('knowledge.hubSubtitle')}
      </p>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.postContainer}>
        {articles.map((article) => {
          const currentTitle = i18n.language === 'de' ? article.title_de : article.title_en;
          const currentSummary = i18n.language === 'de' ? article.summary_de : article.summary_en;

          return (
            <div key={article.id} className={styles.postCard}>
              <div 
                className={styles.postContent} 
                onClick={() => navigate(`/knowledge/${article.id}`)}
              >
                {article.image_url && (
                  <div className={styles.postImage}>
                    <img 
                      src={`${API_BASE_URL}/uploads/${article.image_url}`} 
                      alt={currentTitle} 
                    />
                  </div>
                )}
                
                <h4 className={styles.postTitle}>{currentTitle}</h4>
                
                <div className={styles.postDetails}>
                  <p className={styles.postInfo} style={{ color: '#fff' }}>
                    {currentSummary}
                  </p>
                </div>

                {article.tags && article.tags.length > 0 && (
                  <div className={styles.tagsContainer}>
                    {article.tags.map(tag => (
                      <span key={tag} className={styles.tagItem}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {isAdmin ? (
                <div className={styles.adminActions}>
                  <button 
                    className={styles.editButton}
                    onClick={() => navigate(`/admin/editKnowledge/${article.id}`)}
                  >
                    <FontAwesomeIcon icon={faEdit} /> {t('postCard.btnEdit')}
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDelete(article.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} /> {t('postCard.btnDelete')}
                  </button>
                </div>
              ) : (
                <div className={styles.adminActions}>
                  <button 
                    className={styles.editButton}
                    style={{ width: '100%', padding: '10px' }}
                    onClick={() => navigate(`/knowledge/${article.id}`)}
                  >
                    {t('knowledge.readMore')}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KnowledgeBasePage;