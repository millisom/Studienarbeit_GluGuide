import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../api/axiosConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faClock, faTag } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/ArticleView.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const decodeHTML = (html) => {
  if (!html) return '';
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const ArticleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/admin/knowledge/${id}`);
        setArticle(response.data);
      } catch (err) {
        console.error("Fehler beim Laden des Artikels:", err);
        setError(t('knowledge.errorLoad'));
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id, t]);

  if (loading) return <div className={styles.centered}>{t('knowledge.loading')}</div>;
  if (error) return <div className={styles.errorContainer}>{error}</div>;
  if (!article) return <div className={styles.centered}>{t('knowledge.notFound')}</div>;

  const isDe = i18n.language === 'de';
  const title = isDe ? article.title_de : article.title_en;
  
  const rawContent = isDe ? article.content_de : article.content_en;
  const content = decodeHTML(rawContent);
  
  const category = isDe ? article.category_de : article.category_en;

  return (
    <div className={styles.articleContainer}>
      <button className={styles.backButton} onClick={() => navigate('/knowledge')}>
        <FontAwesomeIcon icon={faArrowLeft} /> {t('knowledge.btnBack')}
      </button>

      <article className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <FontAwesomeIcon icon={faTag} /> {category}
            </span>
            <span className={styles.metaItem}>
              <FontAwesomeIcon icon={faClock} /> {new Date(article.created_at).toLocaleDateString(i18n.language)}
            </span>
          </div>
        </header>

        {article.image_url && (
          <div className={styles.heroImage}>
            <img src={`${API_BASE_URL}/uploads/${article.image_url}`} alt={title} />
          </div>
        )}

        <div 
          className={styles.textContent} 
          dangerouslySetInnerHTML={{ __html: content }} 
        />

        <footer className={styles.footer}>
          <div className={styles.tags}>
            {article.tags && article.tags.map(tag => (
              <span key={tag} className={styles.tagBadge}>#{tag}</span>
            ))}
          </div>
        </footer>
      </article>
    </div>
  );
};

export default ArticleView;