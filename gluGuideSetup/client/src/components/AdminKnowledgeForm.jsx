import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from '../styles/EditPost.module.css';
import { useTranslation } from 'react-i18next';

const AdminKnowledgeForm = ({ initialData, onSubmit, isLoading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    category: '',
    image_url: '',
    tags: '',
    title_en: '',
    summary_en: '',
    content_en: '',
    title_de: '',
    summary_de: '',
    content_de: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submissionData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "")
    };
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 className={styles.label}>Allgemeine Infos</h3>
      <input 
        name="category" 
        placeholder="Kategorie (z.B. Ernährung, Mental Health)" 
        value={formData.category} 
        onChange={handleChange} 
        className={styles.input} 
        required 
      />
      <input 
        name="tags" 
        placeholder="Tags (kommagetrennt)" 
        value={formData.tags} 
        onChange={handleChange} 
        className={styles.input} 
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>

        <div>
          <h3 className={styles.label}>English Content</h3>
          <input name="title_en" placeholder="Title (EN)" value={formData.title_en} onChange={handleChange} className={styles.input} required />
          <textarea name="summary_en" placeholder="Summary (EN)" value={formData.summary_en} onChange={handleChange} className={styles.input} />
          <ReactQuill value={formData.content_en} onChange={(val) => handleQuillChange('content_en', val)} />
        </div>


        <div>
          <h3 className={styles.label}>Deutscher Inhalt</h3>
          <input name="title_de" placeholder="Titel (DE)" value={formData.title_de} onChange={handleChange} className={styles.input} required />
          <textarea name="summary_de" placeholder="Zusammenfassung (DE)" value={formData.summary_de} onChange={handleChange} className={styles.input} />
          <ReactQuill value={formData.content_de} onChange={(val) => handleQuillChange('content_de', val)} />
        </div>
      </div>

      <button type="submit" className={styles.saveButton} disabled={isLoading} style={{ marginTop: '30px' }}>
        {isLoading ? t('adminEditPost.btnSaving') : t('adminEditPost.btnSave')}
      </button>
    </form>
  );
};

export default AdminKnowledgeForm;