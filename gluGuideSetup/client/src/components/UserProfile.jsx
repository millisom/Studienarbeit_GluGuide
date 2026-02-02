import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import parse from 'html-react-parser';
import styles from '../styles/UserProfile.module.css';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { username } = useParams(); 
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

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
        setError('Failed to load user profile');
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  const handlePostClick = (postId) => {
    navigate(`/blogs/view/${postId}`);
  };


  const isOwnProfile = currentUser && currentUser.username === username;

  if (loading) return <p className={styles.loadingMessage}>Loading profile...</p>;
  if (error || !authorData) return <p className={styles.errorMessage}>{error || 'User not found'}</p>;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.contentRectangle}>
        <div className={styles.profileHeader}>
          {authorData.user.profile_picture ? (
            <img
              src={authorData.user.profile_picture} 
              alt={`${authorData.user.username}'s profile`}
              className={styles.profilePicture}
            />
          ) : (
            <div className={styles.profilePicturePlaceholder}>No Image</div>
          )}
          <h2 className={styles.profileUsername}>{authorData.user.username}</h2>
          
          {isOwnProfile && (
            <button 
              className={styles.editProfileButton} 
              onClick={() => navigate('/account')}
            >
              Edit My Profile
            </button>
          )}
        </div>
        <div className={styles.profileBio}>
          {authorData.user.profile_bio
            ? parse(authorData.user.profile_bio)
            : 'No bio available'}
        </div>
      </div>
      <div className={styles.postsSection}>
        <h3>Posts by {authorData.user.username}</h3>
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
                  Created on {new Date(post.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noPosts}>No posts available</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;