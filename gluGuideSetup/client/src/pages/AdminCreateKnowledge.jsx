import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import AdminKnowledgeForm from '../components/AdminKnowledgeForm';
import styles from '../styles/EditPost.module.css';
import { useTranslation } from 'react-i18next';

const AdminCreateKnowledge = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (data) => {
    setLoading(true);
    try {
      await axiosInstance.post('/admin/knowledge', data);
      navigate('/admin');
    } catch (err) {
      console.error(err);
      alert(t('adminCreateKnowledge.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.editPostContainer}>
      <h2 className={styles.title}>{t('adminCreateKnowledge.title')}</h2>
      <AdminKnowledgeForm onSubmit={handleCreate} isLoading={loading} />
    </div>
  );
};
export default AdminCreateKnowledge;