import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useTranslation } from 'react-i18next';
import styles from '../styles/WorryBox.module.css';

const WorryBox = ({ userId }) => {
  const { t } = useTranslation();
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);


  useEffect(() => {
    const fetchWorry = async () => {
      try {
        const res = await axiosInstance.get('/user/worry-box');
        if (res.data?.content) setNote(res.data.content);
      } catch (err) {
        console.error("Could not load worry box content", err);
      }
    };
    if (userId) fetchWorry();
  }, [userId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axiosInstance.post('/user/worry-box', { content: note });
      // Visual feedback could go here
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    if (window.confirm(t('worryBox.confirmClear'))) {
      setNote('');
      axiosInstance.post('/user/worry-box', { content: '' });
    }
  };

  return (
    <div className={styles.worryContainer}>
      <div className={styles.header}>
        <h3> {t('worryBox.title')}</h3>
        <span className={styles.privacyBadge}>{t('worryBox.privateLabel')}</span>
      </div>
      <p className={styles.description}>{t('worryBox.description')}</p>
      
      <textarea
        className={styles.textarea}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t('worryBox.placeholder')}
      />
      
      <div className={styles.actions}>
        <button onClick={handleClear} className={styles.btnClear}>
          {t('worryBox.btnClear')}
        </button>
        <button onClick={handleSave} className={styles.btnSave} disabled={isSaving}>
          {isSaving ? t('worryBox.saving') : t('worryBox.btnSave')}
        </button>
      </div>
    </div>
  );
};

export default WorryBox;