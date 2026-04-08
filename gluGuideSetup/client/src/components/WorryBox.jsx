import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import theme styles
import axiosInstance from '../api/axiosConfig';
import { useTranslation } from 'react-i18next';
import styles from '../styles/WorryBox.module.css';

const WorryBox = () => {
  const { t } = useTranslation();
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Minimal toolbar for a "journal" feel
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  useEffect(() => {
    const fetchWorry = async () => {
      try {
        const res = await axiosInstance.get('/worry-box'); 
        if (res.data?.content) setNote(res.data.content);
      } catch (err) {
        console.error("Could not load worry box content", err);
      }
    };
    fetchWorry(); 
  }, []); 

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axiosInstance.post('/worry-box', { content: note });
      console.log("Worry saved successfully!");
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm(t('worryBox.confirmClear'))) {
      setNote('');
      try {
        await axiosInstance.post('/worry-box', { content: '' });
      } catch (err) {
        console.error("Clear failed", err);
      }
    }
  };

  return (
    <div className={styles.worryContainer}>
      <div className={styles.header}>
        <h3>{t('worryBox.title')}</h3>
        <span className={styles.privacyBadge}>{t('worryBox.privateLabel')}</span>
      </div>
      <p className={styles.description}>{t('worryBox.description')}</p>
      
      {/* Quill Editor replaces the textarea */}
      <div className={styles.editorWrapper}>
        <ReactQuill
          theme="snow"
          value={note}
          onChange={setNote}
          modules={modules}
          placeholder={t('worryBox.placeholder')}
          className={styles.quillEditor}
        />
      </div>
      
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