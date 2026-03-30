import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import ReactQuill from 'react-quill'; 
import 'react-quill/dist/quill.snow.css';
import parse from 'html-react-parser';
import styles from '../styles/Comments.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext'; 
import { useTranslation, Trans } from 'react-i18next';

const CommentsList = ({ comments, currentUserId, isAdmin, refreshComments }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, loading } = useAuth();
  
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [newContent, setNewContent] = useState("");

  const isLoggedIn = !!user;

  const handleAuthorClick = (username) => {
    navigate(`/profile/${username}`);
  };

  const handleLike = async (commentId) => {
    try {
      await axiosInstance.post(
        `/comments/${commentId}/like`,
        {},
        { withCredentials: true }
      );
      refreshComments();
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDislike = async (commentId) => {
    try {
      await axiosInstance.post(
        `/comments/${commentId}/dislike`,
        {},
        { withCredentials: true }
      );
      refreshComments();
    } catch (error) {
      console.error("Error disliking comment:", error);
    }
  };

  const handleDelete = async (commentId) => {
    const url = isAdmin
      ? `/admin/comments/${commentId}`
      : `/comments/${commentId}`;

    if (window.confirm(t('commentsList.deleteConfirm'))) {
      try {
        await axiosInstance.delete(url, { withCredentials: true });
        refreshComments();
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    }
  };

  const handleEdit = async (commentId) => {
    const url = isAdmin
      ? `/admin/comments/${commentId}`
      : `/comments/${commentId}`;

    try {
      await axiosInstance.put(url, { content: newContent }, { withCredentials: true });
      setEditingCommentId(null);
      setNewContent("");
      refreshComments();
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const startEditing = (commentId, currentContent) => {
    setEditingCommentId(commentId);
    setNewContent(currentContent);
  };

  if (loading) {
    return <p className={styles.loadingMessage}>{t('commentsList.loading')}</p>;
  }

  if (!comments || comments.length === 0) {
    if (isLoggedIn) {
        return (
          <p className={styles.noComments}>
            {t('commentsList.noComments')}
          </p>
        );
    }
    return null;
  }

  return (
    <div className={styles.commentsContainer}>
      <h3 className={styles.title}>{t('commentsList.title', { count: comments.length })}</h3>
      <div className={styles.commentsList}>
        {comments.map((comment) => (
          <div key={comment.id} className={styles.commentCard}>
            <p className={styles.commentAuthor}>
              <button 
                className={styles.authorButton}
                onClick={() => handleAuthorClick(comment.username)}
              >
                {comment.username}
              </button>{" "}
              {t('commentsList.said')}
            </p>

            {editingCommentId === comment.id ? (
              <div className={styles.editContainer}>
                <ReactQuill
                  value={newContent}
                  onChange={setNewContent}
                  theme="snow"
                  className={styles.editInput}
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
                <div className={styles.editButtonGroup}>
                  <button
                    onClick={() => handleEdit(comment.id)}
                    className={styles.saveButton}
                  >
                    {t('commentsList.btnSave')}
                  </button>
                  <button
                    onClick={() => setEditingCommentId(null)}
                    className={styles.cancelButton}
                  >
                    {t('commentsList.btnCancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.commentContent}>{comment.content && parse(comment.content)}</div>
            )}

            <p className={styles.commentDate}>
              {t('commentsList.commentedAt')} {new Date(comment.created_at).toLocaleString(i18n.language)}
              {new Date(comment.created_at).getTime() !== new Date(comment.updated_at).getTime() && (
                <>
                  {" "}
                  | {t('commentsList.lastUpdated')} {new Date(comment.updated_at).toLocaleString(i18n.language)}
                </>
              )}
            </p>

            <div className={styles.commentFooter}>
              <div className={styles.buttonGroup}>
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={styles.likeButton}
                    >
                      <FontAwesomeIcon icon={faThumbsUp} /> {t('commentsList.btnLike')} ({comment.likes})
                    </button>
                    <button
                      onClick={() => handleDislike(comment.id)}
                      className={styles.dislikeButton}
                    >
                      <FontAwesomeIcon icon={faThumbsDown} /> {t('commentsList.btnDislike')} ({comment.dislikes})
                    </button>
                  </>
                ) : (
                  <p className={styles.authActionPrompt}>
                    <Trans i18nKey="commentsList.authPrompt">
                      <Link to="/login" className={styles.authLink}>Login</Link> or <Link to="/signUp" className={styles.authLink}>Sign Up</Link> to rate.
                    </Trans>
                  </p>
                )}
                
                {(currentUserId === comment.author_id || isAdmin) && (
                  <>
                    <button
                      onClick={() => startEditing(comment.id, comment.content)}
                      className={styles.editButton}
                    >
                      {t('commentsList.btnEdit')}
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className={styles.deleteButton}
                    >
                      {t('commentsList.btnDelete')}
                    </button>
                  </>
                )}
              </div>
              <small className={styles.commentId}>{t('commentsList.commentIdLabel')} (#{comment.id})</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

CommentsList.propTypes = {
  comments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.any.isRequired,
    username: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    updated_at: PropTypes.string.isRequired,
    likes: PropTypes.number,
    dislikes: PropTypes.number,
    author_id: PropTypes.any.isRequired,
  })).isRequired,
  currentUserId: PropTypes.any,
  isAdmin: PropTypes.bool,
  refreshComments: PropTypes.func.isRequired,
};

CommentsList.defaultProps = {
  currentUserId: null,
  isAdmin: false,
};

export default CommentsList;