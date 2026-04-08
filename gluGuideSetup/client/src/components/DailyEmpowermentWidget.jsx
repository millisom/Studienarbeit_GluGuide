import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { empowermentSnippets } from '../data/empowermentSnippets';
import styles from '../styles/Empowerment.module.css';

const DailyEmpowermentWidget = () => {
  const { t } = useTranslation();
  const [snippetKey, setSnippetKey] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * empowermentSnippets.length);
    setSnippetKey(empowermentSnippets[randomIndex]);
  }, []);

  if (!snippetKey) return null;

  return (
    <div className={styles.empowermentCard}>
      <h3 className={styles.empowermentTitle}> {t('empowerment.dailyMotivationTitle')}</h3>
      <p className={styles.empowermentText}>{t(snippetKey)}</p>
    </div>
  );
};

export default DailyEmpowermentWidget;