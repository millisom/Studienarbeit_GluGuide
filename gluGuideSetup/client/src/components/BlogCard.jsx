import styles from '../styles/BlogCard.module.css';
import { useNavigate } from 'react-router-dom';
import parse from 'html-react-parser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faHeart } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../api/axiosConfig';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext'; 
import { useTranslation } from 'react-i18next';

const BlogCard = ({ blog }) => {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth(); 
    const { t } = useTranslation();

    const handleViewClick = () => {
        navigate(`/blogs/view/${blog.id}`);
    };

    const handleDelete = async () => {
        if (window.confirm(t('blogCard.deleteConfirm'))) {
            try {
                await axiosInstance.delete(`/deletePost/${blog.id}`, {
                    withCredentials: true,
                });
                alert(t('blogCard.deleteSuccess'));
                window.location.reload(); 
            } catch (error) {
                console.error('Error deleting post:', error);
                alert(t('blogCard.deleteError'));
            }
        }
    };

    const isAuthor = user && blog.username === user.username;
    const canEditOrDelete = isAdmin || isAuthor;

    return (
        <div className={styles.card}>
            <div className={styles.cardContent}>
                <h2 className={styles.cardTitle} onClick={handleViewClick}>
                    {blog.title}
                </h2>
                <div className={styles.cardDescription}>
                    {blog.content.length > 150
                        ? parse(`${blog.content.slice(0, 150)}...`)
                        : parse(blog.content)}
                </div>
                {blog.tags && blog.tags.length > 0 && (
                    <div className={styles.tagsContainer}>
                        {blog.tags.map((tag, index) => (
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
                <div className={styles.cardFooter}>
                    <p className={styles.postLikes}>
                        <FontAwesomeIcon icon={faHeart} className={styles.heart} />{" "}
                        {(() => {
                            const likesCount = blog.likes_count ? blog.likes_count : (blog.likes ? blog.likes.length : 0);
                            return (
                                <>{likesCount} {likesCount === 1 ? t('blogCard.like') : t('blogCard.likes')}</>
                            );
                        })()}
                    </p>
                    
                    {canEditOrDelete && (
                        <div className={styles.iconContainer}>
                            <button
                                className={styles.iconButton}
                                onClick={() => navigate(`/blogs/edit/${blog.id}`)}
                                aria-label={t('blogCard.ariaEdit', { title: blog.title })}
                            >
                                <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                                className={styles.iconButton}
                                onClick={handleDelete}
                                aria-label={t('blogCard.ariaDelete', { title: blog.title })}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

BlogCard.propTypes = {
    blog: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        username: PropTypes.string,
        likes: PropTypes.array,
        likes_count: PropTypes.number,
        tags: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
};

export default BlogCard;