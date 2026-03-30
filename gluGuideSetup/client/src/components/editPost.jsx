import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from '../styles/EditPost.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faXmark, faSave } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const BACKEND_URL = 'http://localhost:8080'; 

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axiosInstance.get(`/getPost/${id}`, {
          withCredentials: true,
        });

        setTitle(response.data.title);
        setContent(response.data.content);
        setTagsInput(Array.isArray(response.data.tags) ? response.data.tags.join(', ') : '');
        
        if (response.data.post_picture) {
          setImageUrl(`${BACKEND_URL}/uploads/${response.data.post_picture}`);
        } else {
          setImageUrl('');
        }
      } catch (error) {
        setError(t('editPost.errorLoad'));
        console.error('Error loading post:', error.response ? error.response.data : error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id, user, navigate, t]);

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    try {
      const payload = { title, content, tags: tagsInput };
      await axiosInstance.put(
        `/updatePost/${id}`,
        payload,
        { withCredentials: true }
      );
      navigate(`/blogs/view/${id}`);
    } catch (error) {
      setError(t('editPost.errorSave'));
      console.error('Error saving post:', error.response ? error.response.data : error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImage = async () => {
    if (!image) {
      alert(t('editPost.errorNoImageSelected'));
      return;
    }

    const formData = new FormData();
    formData.append('postImage', image);

    try {
      const response = await axiosInstance.post(`/uploadPostImage/${id}`, formData, {
        withCredentials: true,
      });
      
      setImageUrl(`${BACKEND_URL}${response.data.imageUrl}`);
      alert(t('editPost.successUpload'));
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(t('editPost.errorUpload'));
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm(t('editPost.confirmDeleteImage'))) return;
    try {
      await axiosInstance.delete(`/deletePostImage/${id}`, {
        withCredentials: true,
      });
      setImageUrl('');
    } catch (error) {
      console.error('Error deleting image:', error);
      setError(t('editPost.errorDeleteImage'));
    }
  };

  if (!user && !isLoading) {
    return <p className={styles.errorMessage}>{t('editPost.errorAuth')}</p>;
  }

  return (
    <div className={styles.editPostContainer}>
      <h2 className={styles.title}>{t('editPost.title')}</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {isLoading && <p>{t('editPost.loading')}</p>}

      {!isLoading && (
        <div className={styles.form}>
          <label className={styles.label}>{t('editPost.labelPostTitle')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('editPost.placeholderTitle')}
            className={styles.input}
          />

          <label className={styles.label}>{t('editPost.labelContent')}</label>
          <ReactQuill
            value={content}
            onChange={setContent}
            className={styles.quillEditor}
          />

          <label className={styles.label}>{t('editPost.labelTags')}</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder={t('editPost.placeholderTags')}
            className={styles.input}
          />

          <div className={styles.imageSection}>
            <label className={styles.label}>{t('editPost.labelCurrentImage')}</label>
            {imageUrl ? (
              <>
                <div className={styles.imagePreview}>
                  <img
                    src={imageUrl}
                    alt="Post Preview"
                    className={styles.previewImage}
                    onError={(e) => {
                        e.target.src = `https://via.placeholder.com/150?text=${t('editPost.imageNotFound')}`;
                    }}
                  />
                </div>
                <div className={styles.inputField}>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={handleDeleteImage}
                  >
                    <FontAwesomeIcon icon={faTrash} className={styles.iconSpacing} />
                    {t('editPost.btnRemoveImage')}
                  </button>
                </div>
              </>
            ) : (
              <p className={styles.noImageText}>{t('editPost.noImage')}</p>
            )}

            <label className={styles.label} style={{ marginTop: '20px' }}>{t('editPost.labelUploadImage')}</label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => setImage(e.target.files[0])}
              className={styles.fileInput}
            />
            <button onClick={handleUploadImage} className={styles.uploadButton} disabled={!image}>
              {t('editPost.btnUpload')}
            </button>
          </div>

          <div className={styles.buttonGroup}>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={styles.saveButton}
            >
              <FontAwesomeIcon icon={faSave} className={styles.iconSpacing} />
              {isLoading ? t('editPost.btnSaving') : t('editPost.btnSave')}
            </button>
            <button
              onClick={() => navigate(`/blogs/view/${id}`)}
              className={styles.cancelButton}
            >
              <FontAwesomeIcon icon={faXmark} className={styles.iconSpacing} />
              {t('editPost.btnCancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPost;