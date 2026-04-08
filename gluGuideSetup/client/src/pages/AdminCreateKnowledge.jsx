import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import AdminKnowledgeForm from '../components/AdminKnowledgeForm';
import styles from '../styles/EditPost.module.css';

const AdminCreateKnowledge = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (data) => {
    setLoading(true);
    try {
      await axiosInstance.post('/admin/knowledge', data);
      navigate('/admin');
    } catch (err) {
      console.error(err);
      alert("Fehler beim Erstellen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.editPostContainer}>
      <h2 className={styles.title}>Neuen Wissensartikel anlegen</h2>
      <AdminKnowledgeForm onSubmit={handleCreate} isLoading={loading} />
    </div>
  );
};
export default AdminCreateKnowledge;