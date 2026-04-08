import React from 'react';
import { useTranslation } from 'react-i18next';
import { knowledgeArticles } from '../data/knowledgeArticles';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/pages.module.css';

const KnowledgeBasePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>{t('knowledge.hubTitle')}</h1>
      <p>{t('knowledge.hubSubtitle')}</p>

      <div className={styles.articlesGrid}>
        {knowledgeArticles.map((article) => (
          <div key={article.id} className={styles.articleCard}>
            <h3>{t(`${article.translationKey}.title`)}</h3>
            <p>{t(`${article.translationKey}.summary`)}</p>
            <div className={styles.tagsContainer}>
              {article.tags.map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
            <button 
              onClick={() => navigate(`/knowledge/${article.id}`)}
              className={styles.primaryButton}
            >
              {t('knowledge.readMore')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBasePage;