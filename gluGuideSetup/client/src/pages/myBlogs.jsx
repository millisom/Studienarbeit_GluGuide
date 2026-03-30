import { useEffect, useState } from 'react';
import BlogCard from '../components/BlogCard';
import styles from '../styles/pages.module.css';
import axiosInstance from '../api/axiosConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFeatherAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MyBlogs = () => {
    const { t } = useTranslation();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axiosInstance.get('/getUserPost', {
                    withCredentials: true,
                });
                setBlogs(response.data);
            } catch (error) {
                console.error('Error fetching blogs:', error);
                setError(t('myBlogs.error'));
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, [t]);

    if (loading) {
        return <div className={styles.loadingStatePage}>{t('myBlogs.loading')}</div>;
    }

    if (error) {
        return <div className={styles.errorStatePage}>{error}</div>;
    }

    return (
        <div className={styles.myBlogsPageContainer}>
            <header className={styles.myBlogsHeader}>
                <h1 className={styles.myBlogsTitle}>{t('myBlogs.title')}</h1>
                <button 
                    className={`${styles.cardButton} ${styles.createPostButtonPrimary}`}
                    onClick={() => navigate('/create/post')} 
                    aria-label={t('myBlogs.ariaCreate')}
                >
                    <FontAwesomeIcon icon={faPlus} /> {t('myBlogs.btnCreate')}
                </button>
            </header>

            {blogs.length > 0 ? (
                <div className={styles.myBlogsGrid}>
                    {blogs.map((blog) => (
                        <BlogCard key={blog.id} blog={blog} />
                    ))}
                </div>
            ) : (
                <div className={styles.noPostsMessage}>
                    <FontAwesomeIcon icon={faFeatherAlt} size="3x" className={styles.noPostsIcon} />
                    <h2>{t('myBlogs.emptyTitle')}</h2>
                    <p>{t('myBlogs.emptyDescription')}</p>
                </div>
            )}
        </div>
    );
};

export default MyBlogs;