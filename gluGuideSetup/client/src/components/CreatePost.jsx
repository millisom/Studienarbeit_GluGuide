import { useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import ReactQuill from 'react-quill'; 
import 'react-quill/dist/quill.snow.css'; 
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/CreateBlogPost.module.css';
import { useAuth } from '../context/AuthContext'; 
import { useTranslation, Trans } from 'react-i18next';

const CreatePost = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postPicture, setPostPicture] = useState(null);
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setPostPicture(e.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
        setError(t('createPost.errorAuth'));
        return;
    }

    const plainTextContent = content.replace(/<[^>]+>/g, '').trim();
    if (!title.trim() || !plainTextContent) {
        setError(t('createPost.errorEmpty'));
        setSuccessMessage('');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('tags', tagsInput);
    if (postPicture) formData.append('post_picture', postPicture);

    setError('');
    setSuccessMessage('');

    try {
      const response = await axiosInstance.post('/createPost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (response.data?.post?.id) {
        const { id } = response.data.post;
        setTitle('');
        setContent('');
        setPostPicture(null);
        setTagsInput('');
        setSuccessMessage(t('createPost.successMsg'));
        setTimeout(() => navigate(`/blogs/view/${id}`), 1500);
      } else {
        console.error('Post ID not found in response:', response.data);
        setError(t('createPost.errorRedirect'));
        setTitle('');
        setContent('');
        setPostPicture(null);
        setTagsInput('');
      }

    } catch (errCatch) {
      if (errCatch.response && errCatch.response.status === 401) {
        setError(t('createPost.errorAuth'));
      } else {
        console.error('Error creating post:', errCatch.response ? errCatch.response.data : errCatch.message);
        setError(t('createPost.errorFailed'));
      }
    }
  };

  if (loading) {
    return <div className={styles.createPostContainer}><p className={styles.loadingMessage || 'formLoading'}>{t('createPost.loading')}</p></div>;
  }

  if (!user) {
    return (
      <div className={styles.createPostContainer}> 
        <div className={styles.authPromptContainer}> 
          <p className={styles.authPromptMessage}>
            <Trans i18nKey="createPost.authPrompt">
                Want to share your insights? Please <Link to="/login" className={styles.authLink}>Login</Link> or {' '}
                <Link to="/signUp" className={styles.authLink}>Create an Account</Link> to publish your blog posts.
            </Trans>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.createPostContainer}>
      <div className={styles.createPostRectangle}>
        <h2 className={styles.formTitle}>{t('createPost.formTitle')}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('createPost.labelTitle')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('createPost.labelContent')}</label>
            <ReactQuill
              value={content}
              onChange={setContent}
              className={styles.quillEditor}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline','strike', 'blockquote'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
                  ['link', 'image'],
                  ['clean']
                ]
              }}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('createPost.labelTags')}</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className={styles.input}
              placeholder={t('createPost.placeholderTags')}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('createPost.labelUpload')}</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
          </div>
          <button type="submit" className={styles.submitButton}>
            {t('createPost.submitBtn')}
          </button>
          {error && <p className={styles.errorMessage}>{error}</p>}
          {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreatePost;