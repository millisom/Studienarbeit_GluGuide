import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from '../api/axiosConfig';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styles from "../styles/EditPost.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faXmark, faSave } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminEditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setError('');
    axiosInstance
      .get(`/getPost/${id}`, { withCredentials: true })
      .then((res) => {
        setTitle(res.data.title);
        setContent(res.data.content);
        setTagsInput(Array.isArray(res.data.tags) ? res.data.tags.join(', ') : '');
        setImageUrl(
          res.data.post_picture
            ? `${API_BASE_URL}/uploads/${res.data.post_picture}`
            : ""
        );
      })
      .catch((err) => {
        console.error("Error loading post:", err.response ? err.response.data : err.message);
        setError(t('adminEditPost.errorLoad'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, t]);

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    try {
      const payload = { title, content, tags: tagsInput };
      await axiosInstance.put(
        `/admin/posts/${id}`,
        payload,
        { withCredentials: true }
      );
      navigate(`/blogs/view/${id}`);
    } catch (err) {
      console.error("Error saving post:", err.response ? err.response.data : err.message);
      setError(t('adminEditPost.errorSave'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImage = async () => {
    if (!image) {
      alert(t('adminEditPost.alertSelectImage'));
      return;
    }

    const formData = new FormData();
    formData.append("postImage", image);

    try {
      const response = await axiosInstance.post(
        `/uploadPostImage/${id}`,
        formData,
        { withCredentials: true }
      );
      setImageUrl(response.data.imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError(t('adminEditPost.errorUpload'));
    }
  };

  const handleDeleteImage = async () => {
    try {
      await axiosInstance.delete(`/deletePostImage/${id}`, {
        withCredentials: true,
      });
      setImageUrl("");
    } catch (error) {
      console.error("Error deleting image:", error);
      setError(t('adminEditPost.errorDeleteImage'));
    }
  };

  return (
    <div className={styles.editPostContainer}>
      <h2 className={styles.title}>{t('adminEditPost.title', { title })}</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {isLoading && <p>{t('adminEditPost.loading')}</p>}

      {!isLoading && (
        <div className={styles.form}>
          <label className={styles.label}>{t('adminEditPost.labelPostTitle')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
          />

          <label className={styles.label}>{t('adminEditPost.labelContent')}</label>
          <ReactQuill
            value={content}
            onChange={setContent}
            className={styles.quillEditor}
          />

          <label className={styles.label}>{t('adminEditPost.labelTags')}</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder={t('adminEditPost.placeholderTags')}
            className={styles.input}
          />

          <label className={styles.label}>{t('adminEditPost.labelCurrentImage')}</label>
          {imageUrl ? (
            <>
              <div className={styles.imagePreview}>
                <img
                  src={imageUrl}
                  alt="Post Preview"
                  className={styles.previewImage}
                />
              </div>
              <div className={styles.inputField}>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={handleDeleteImage}
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    className={styles.iconSpacing}
                  />
                  {t('adminEditPost.btnRemoveImage')}
                </button>
              </div>
            </>
          ) : (
            <>
              <p>{t('adminEditPost.noImageSet')}</p>
              <button
                type="button"
                className={styles.deleteButton}
                onClick={handleDeleteImage}
                disabled
              >
                <FontAwesomeIcon icon={faTrash} className={styles.iconSpacing} />
                {t('adminEditPost.btnRemoveImage')}
              </button>
            </>
          )}

          <label className={styles.label}>{t('adminEditPost.labelUploadNew')}</label>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            className={styles.fileInput}
          />
          <small>{t('adminEditPost.uploadTip')}</small>
          <button onClick={handleUploadImage} className={styles.uploadButton}>
            {t('adminEditPost.btnUpload')}
          </button>
          
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className={styles.saveButton}
            >
              <FontAwesomeIcon icon={faSave} className={styles.iconSpacing} />
              {isLoading ? t('adminEditPost.btnSaving') : t('adminEditPost.btnSave')}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/blogs/view/${id}`)}
              className={styles.cancelButton}
            >
              <FontAwesomeIcon icon={faXmark} className={styles.iconSpacing} />
              {t('adminEditPost.btnCancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEditPost;