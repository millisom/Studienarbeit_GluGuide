import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import parse from 'html-react-parser';
import CommentsSection from './CommentsSection';
import styles from '../styles/SingleBlog.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ViewPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, isAdmin, loading: authLoading } = useAuth();
  const isLoggedIn = !!user;

  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const postResponse = await axiosInstance.get(`/getUserPost/${id}`, {
          withCredentials: true,
        });
        setPost(postResponse.data || {});
      } catch (err) {
        setError('Failed to load post');
        console.error('Error loading post:', err.response ? err.response.data : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    try {
      const response = await axiosInstance.post(`/toggleLike/${id}`, {}, { withCredentials: true });
      setPost((prevPost) => ({
        ...prevPost,
        likesCount: response.data.likesCount,
      }));
      setInfoMessage('');
    } catch (err) {
      setInfoMessage(err.response?.data.message || 'An error occurred while liking the post.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await axiosInstance.delete(`/deletePost/${id}`, { withCredentials: true });
        alert('Post deleted successfully.');
        navigate('/blogs');
      } catch (err) {
        alert('Failed to delete post.');
      }
    }
  };

  const handleAuthorClick = (authorUsername) => {
    navigate(`/profile/${authorUsername}`);
  };

  if (loading || authLoading) return <p className={styles.loadingMessage}>Loading post...</p>;
  if (error) return <p className={styles.errorMessage}>{error}</p>;
  if (!post) return <p className={styles.errorMessage}>Post not found.</p>;

  const isAuthor = user && post.username === user.username;
  const canEditOrDelete = isAdmin || isAuthor;

  const currentLikes = post.likesCount ?? (post.likes ? post.likes.length : 0);

  const likeButtonContent = !isLoggedIn ? (
    "Login to like this post!"
  ) : (
    <>
      <FontAwesomeIcon icon={faHeart} className={styles.heart} /> {' '}
      {currentLikes} Like{currentLikes !== 1 && 's'}
    </>
  );

  return (
    <div className={styles.viewPostContainer}>
      <div className={styles.contentRectangle}>

        {canEditOrDelete && (
          <div className={styles.actionButtons}>
            <button
              className={styles.editBtn}
              onClick={() => navigate(isAdmin ? `/admin/editPost/${id}` : `/blogs/edit/${id}`)}
            >
              <FontAwesomeIcon icon={faEdit} /> Edit
            </button>
            <button className={styles.deleteBtn} onClick={handleDelete}>
              <FontAwesomeIcon icon={faTrash} /> Delete
            </button>
          </div>
        )}

        <h2 className={styles.postTitle}>{post.title}</h2>
        
        <button onClick={() => handleAuthorClick(post.username)} className={styles.authorButton}>
          Author: {post.username}
        </button>

        <p className={styles.postDate}>
          Created on: {new Date(post.created_at).toLocaleDateString()}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className={styles.tagsContainer}>
            {post.tags.map((tag, index) => (
              <button
                key={index}
                className={styles.tagItem}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/blogs?tag=${encodeURIComponent(tag)}`);
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className={styles.postContainerBody}>
          {post.post_picture && (
            <img
              src={`${API_BASE_URL}/uploads/${post.post_picture}`}
              alt="Blog post"
              className={styles.image}
            />
          )}
          <div className={styles.postContainerContentBox}>
            {post.content && parse(post.content)}
          </div>
        </div>

        <button onClick={handleLike} className={styles.likeButton}>
          {likeButtonContent}
        </button>

        {infoMessage && <p className={styles.infoMessage}>{infoMessage}</p>}
      </div>

      <CommentsSection postId={id} />
    </div>
  );
};

export default ViewPost;