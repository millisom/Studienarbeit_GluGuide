import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from '../styles/EditPost.module.css'; 
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faUpload, faImage } from "@fortawesome/free-solid-svg-icons";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminKnowledgeForm = ({ initialData, onSubmit, isLoading }) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    category_de: '', category_en: '', tags: '',
    title_de: '', title_en: '',
    summary_de: '', summary_en: '',
    content_de: '', content_en: '',
    image_url: ''
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const summaryModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || ''
      });
      if (initialData.image_url) {
        setPreviewUrl(`${API_BASE_URL}/uploads/${initialData.image_url}`);
      }
    }
  }, [initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleQuillChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key === 'tags') {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(t => t !== "");
        submissionData.append(key, JSON.stringify(tagsArray));
      } else {
        submissionData.append(key, formData[key]);
      }
    });

    if (selectedFile) {
      submissionData.append('knowledgeImage', selectedFile);
    }

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup} style={{ marginBottom: '30px', textAlign: 'left' }}>
        <label className={styles.label}>
          <FontAwesomeIcon icon={faImage} style={{ marginRight: '8px' }} />
          {t('adminKnowledgeForm.imageOptional')}
        </label>
        {previewUrl && (
          <div className={styles.imagePreview} style={{ margin: '10px 0' }}>
            <img src={previewUrl} alt={t('adminKnowledgeForm.preview')} className={styles.previewImage} style={{ maxWidth: '300px', borderRadius: '8px' }} />
          </div>
        )}
        <input type="file" onChange={handleFileChange} className={styles.fileInput} accept="image/*" />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>{t('adminKnowledgeForm.tagsLabel')}</label>
        <input 
          name="tags" 
          placeholder={t('adminKnowledgeForm.tagsPlaceholder')} 
          value={formData.tags} 
          onChange={(e) => setFormData({...formData, tags: e.target.value})} 
          className={styles.input} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px' }}>
        <div className={styles.languageSection}>
          <h3 className={styles.title} style={{ fontSize: '1.2rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '5px' }}>
            {t('adminKnowledgeForm.sectionDe')}
          </h3>
          
          <label className={styles.label}>{t('adminKnowledgeForm.categoryDe')}</label>
          <input 
            placeholder={t('adminKnowledgeForm.categoryPlaceholderDe')} 
            value={formData.category_de} 
            onChange={(e) => setFormData({...formData, category_de: e.target.value})} 
            className={styles.input} 
            required 
          />

          <label className={styles.label}>{t('adminKnowledgeForm.titleDe')}</label>
          <input 
            placeholder={t('adminKnowledgeForm.titlePlaceholderDe')} 
            value={formData.title_de} 
            onChange={(e) => setFormData({...formData, title_de: e.target.value})} 
            className={styles.input} 
            required 
          />

          <label className={styles.label}>{t('adminKnowledgeForm.summaryDe')}</label>
          <ReactQuill 
            theme="snow" 
            modules={summaryModules}
            value={formData.summary_de} 
            onChange={(val) => handleQuillChange('summary_de', val)} 
          />

          <label className={styles.label} style={{ marginTop: '20px', display: 'block' }}>{t('adminKnowledgeForm.contentDe')}</label>
          <ReactQuill 
            theme="snow" 
            value={formData.content_de} 
            onChange={(val) => handleQuillChange('content_de', val)} 
          />
        </div>

        <div className={styles.languageSection}>
          <h3 className={styles.title} style={{ fontSize: '1.2rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '5px' }}>
            {t('adminKnowledgeForm.sectionEn')}
          </h3>

          <label className={styles.label}>{t('adminKnowledgeForm.categoryEn')}</label>
          <input 
            placeholder={t('adminKnowledgeForm.categoryPlaceholderEn')} 
            value={formData.category_en} 
            onChange={(e) => setFormData({...formData, category_en: e.target.value})} 
            className={styles.input} 
            required 
          />

          <label className={styles.label}>{t('adminKnowledgeForm.titleEn')}</label>
          <input 
            placeholder={t('adminKnowledgeForm.titlePlaceholderEn')} 
            value={formData.title_en} 
            onChange={(e) => setFormData({...formData, title_en: e.target.value})} 
            className={styles.input} 
            required 
          />

          <label className={styles.label}>{t('adminKnowledgeForm.summaryEn')}</label>
          <ReactQuill 
            theme="snow" 
            modules={summaryModules}
            value={formData.summary_en} 
            onChange={(val) => handleQuillChange('summary_en', val)} 
          />

          <label className={styles.label} style={{ marginTop: '20px', display: 'block' }}>{t('adminKnowledgeForm.contentEn')}</label>
          <ReactQuill 
            theme="snow" 
            value={formData.content_en} 
            onChange={(val) => handleQuillChange('content_en', val)} 
          />
        </div>
      </div>

      <button type="submit" className={styles.saveButton} disabled={isLoading} style={{ marginTop: '40px', width: '100%', padding: '15px' }}>
        <FontAwesomeIcon icon={isLoading ? faSave : faUpload} style={{ marginRight: '10px' }} />
        {isLoading ? t('adminEditPost.btnSaving') : t('adminEditPost.btnSave')}
      </button>
    </form>
  );
};

export default AdminKnowledgeForm;