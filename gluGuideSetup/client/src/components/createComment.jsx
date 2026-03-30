import { useState } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../api/axiosConfig';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from '../styles/Comments.module.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { useTranslation, Trans } from 'react-i18next';

const CreateComment = ({ postId, onCommentCreated, hasExistingComments }) => {
  const { user, loading } = useAuth(); 
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!user) return;

    const plainText = content.replace(/<[^>]+>/g, '').trim();
    if (!plainText) {
      setError(t('createComment.errorEmpty'));
      setSuccessMessage("");
      return;
    }

    try {
      await axiosInstance.post(
        "/comments",
        { post_id: postId, content },
        { withCredentials: true }
      );
      setContent("");
      setSuccessMessage(t('createComment.successMsg'));
      setError("");
      if (onCommentCreated) onCommentCreated();
    } catch (error) {
      console.error("Error creating comment:", error);
      setError(t('createComment.errorFailed'));
      setSuccessMessage("");
    }
  };

  if (loading) {
    return <p className={styles.loadingMessage}>{t('createComment.loading')}</p>;
  }

  if (!user) {
    return (
      <div className={styles.loggedOutCommentPrompt}>
        {hasExistingComments ? (
          <p>
            <Trans i18nKey="createComment.promptDiscussion">
              Please <Link to="/login" className={styles.authLink}>login</Link> or {' '}
              <Link to="/signUp" className={styles.authLink}>create an account</Link> to add a comment and be part of this discussion.
            </Trans>
          </p>
        ) : (
          <p>
            <Trans i18nKey="createComment.promptFirst">
              Please <Link to="/login" className={styles.authLink}>login</Link> or {' '}
              <Link to="/signUp" className={styles.authLink}>create an account</Link> to be the first one to comment!
            </Trans>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.addCommentContainer}>
      <h3 className={styles.title}>{t('createComment.title')}</h3>
      <form onSubmit={handleSubmit} className={styles.addCommentForm}>
        <ReactQuill
          value={content}
          onChange={setContent}
          theme="snow"
          className={styles.commentTextarea}
          modules={{
            toolbar: [
              [{ 'header': [1, 2, false] }],
              ['bold', 'italic', 'underline','strike', 'blockquote'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['link'],
              ['clean']
            ]
          }}
        />
        <button type="submit" className={styles.submitButton}>
          {t('createComment.submitBtn')}
        </button>
        {error && <p className={styles.error}>{error}</p>}
        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
      </form>
    </div>
  );
};

CreateComment.propTypes = {
  postId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  onCommentCreated: PropTypes.func.isRequired,
  hasExistingComments: PropTypes.bool,
};

CreateComment.defaultProps = {
    hasExistingComments: true,
};

export default CreateComment;