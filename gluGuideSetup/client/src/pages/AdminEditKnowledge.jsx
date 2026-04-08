import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import AdminKnowledgeForm from '../components/AdminKnowledgeForm';
import styles from '../styles/EditPost.module.css';

const AdminEditKnowledge = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axiosInstance.get(`/admin/knowledge/${id}`).then(res => setArticle(res.data));
  }, [id]);

  const handleUpdate = async (data) => {
    setLoading(true);
    try {
      await axiosInstance.put(`/admin/knowledge/${id}`, data);
      navigate('/admin');
    } catch (err) {
      console.error(err);
      alert("Fehler beim Aktualisieren.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.editPostContainer}>
      <h2 className={styles.title}>Artikel bearbeiten</h2>
      {article && <AdminKnowledgeForm initialData={article} onSubmit={handleUpdate} isLoading={loading} />}
    </div>
  );
};
export default AdminEditKnowledge;