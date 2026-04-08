import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import AdminKnowledgeForm from '../components/AdminKnowledgeForm';
import styles from '../styles/EditPost.module.css';
import { useTranslation } from 'react-i18next';

const AdminEditKnowledge = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await axiosInstance.get(`/admin/knowledge/${id}`, { withCredentials: true });
        setArticle(res.data);
      } catch (err) {
        console.error("Fehler beim Laden des Artikels:", err);
        setError(t('adminEditKnowledge.errorLoad'));
      }
    };
    fetchArticle();
  }, [id, t]);

  const handleUpdate = async (formData) => {
    setLoading(true);
    setError('');
    try {
      await axiosInstance.put(`/admin/knowledge/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      
      navigate('/admin');
    } catch (err) {
      console.error("Update-Fehler:", err);
      setError(t('adminEditPost.errorSave'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.editPostContainer}>
      <h2 className={styles.title}>{t('adminEditKnowledge.title')}</h2>
      
      {error && <p className={styles.errorMessage}>{error}</p>}
      
      {article ? (
        <AdminKnowledgeForm 
          initialData={article} 
          onSubmit={handleUpdate} 
          isLoading={loading} 
        />
      ) : (
        <p>{t('adminEditPost.loading')}</p>
      )}
    </div>
  );
};

export default AdminEditKnowledge;