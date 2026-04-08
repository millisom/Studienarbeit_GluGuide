import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from '../styles/EditPost.module.css'; 
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminKnowledgeForm = ({ initialData, onSubmit, isLoading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    category: '', tags: '',
    title_en: '', summary_en: '', content_en: '',
    title_de: '', summary_de: '', content_de: '',
    image_url: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

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
      <div className={styles.inputGroup}>
        <label className={styles.label}>Bild hochladen</label>
        {previewUrl && (
          <div className={styles.imagePreview}>
            <img src={previewUrl} alt="Preview" className={styles.previewImage} />
          </div>
        )}
        <input type="file" onChange={handleFileChange} className={styles.fileInput} />
      </div>

      <label className={styles.label}>Kategorie</label>
      <input 
        name="category" 
        value={formData.category} 
        onChange={(e) => setFormData({...formData, category: e.target.value})} 
        className={styles.input} 
        required 
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>

        <div>
          <h3 className={styles.label}>Deutsch</h3>
          <input placeholder="Titel (DE)" value={formData.title_de} onChange={(e) => setFormData({...formData, title_de: e.target.value})} className={styles.input} required />
          <p className={styles.label}>Kurz-Zusammenfassung (Teaser)</p>
          <ReactQuill theme="snow" value={formData.summary_de} onChange={(val) => handleQuillChange('summary_de', val)} />
          <p className={styles.label} style={{marginTop: '15px'}}>Vollständiger Artikel</p>
          <ReactQuill theme="snow" value={formData.content_de} onChange={(val) => handleQuillChange('content_de', val)} />
        </div>


        <div>
          <h3 className={styles.label}>English</h3>
          <input placeholder="Title (EN)" value={formData.title_en} onChange={(e) => setFormData({...formData, title_en: e.target.value})} className={styles.input} required />
          <p className={styles.label}>Short Summary (Teaser)</p>
          <ReactQuill theme="snow" value={formData.summary_en} onChange={(val) => handleQuillChange('summary_en', val)} />
          <p className={styles.label} style={{marginTop: '15px'}}>Full Article Content</p>
          <ReactQuill theme="snow" value={formData.content_en} onChange={(val) => handleQuillChange('content_en', val)} />
        </div>
      </div>

      <button type="submit" className={styles.saveButton} disabled={isLoading} style={{ marginTop: '30px' }}>
        <FontAwesomeIcon icon={faUpload} style={{marginRight: '8px'}} />
        {isLoading ? t('adminEditPost.btnSaving') : t('adminEditPost.btnSave')}
      </button>
    </form>
  );
};

export default AdminKnowledgeForm;