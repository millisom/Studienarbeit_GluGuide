import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import parse from 'html-react-parser';
import styles from '../styles/UserProfile.module.css';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const UserProfile = () => {
  const { username } = useParams(); 
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [authorData, setAuthorData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosInstance.get(`/profile/${username}`);
        setAuthorData(response.data);
      } catch (error) {
        setError(t('userProfile.errorLoad'));
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username, t]);

  const handlePostClick = (postId) => {
    navigate(`/blogs/view/${postId}`);
  };

  const isOwnProfile = currentUser && currentUser.username === username;

  if (loading) return <p className={styles.loadingMessage}>{t('userProfile.loading')}</p>;
  if (error || !authorData) return <p className={styles.errorMessage}>{error || t('userProfile.userNotFound')}</p>;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.contentRectangle}>
        <div className={styles.profileHeader}>
          {authorData.user.profile_picture ? (
            <img
              src={authorData.user.profile_picture} 
              alt={t('userProfile.ariaProfile', { username: authorData.user.username })}
              className={styles.profilePicture}
            />
          ) : (
            <div className={styles.profilePicturePlaceholder}>{t('userProfile.noImage')}</div>
          )}
          <h2 className={styles.profileUsername}>{authorData.user.username}</h2>
          
          {isOwnProfile && (
            <button 
              className={styles.editProfileButton} 
              onClick={() => navigate('/account')}
            >
              {t('userProfile.btnEdit')}
            </button>
          )}
        </div>
        <div className={styles.profileBio}>
          {authorData.user.profile_bio
            ? parse(authorData.user.profile_bio)
            : t('userProfile.noBio')}
        </div>
      </div>
      <div className={styles.postsSection}>
        <h3>{t('userProfile.postsBy', { username: authorData.user.username })}</h3>
        {authorData.posts.length > 0 ? (
          <ul className={styles.postsList}>
            {authorData.posts.map((post) => (
              <li
                key={post.id}
                className={styles.postItem}
                onClick={() => handlePostClick(post.id)}
              >
                <h4 className={styles.postTitle}>{post.title}</h4>
                <p className={styles.postDate}>
                  {t('userProfile.createdOn')} {new Date(post.created_at).toLocaleDateString(i18n.language)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noPosts}>{t('userProfile.noPosts')}</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;