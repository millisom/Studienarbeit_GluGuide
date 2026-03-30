import { useState, useEffect } from 'react';
import GlucoseLog from "../components/GlucoseLog";
import PostCard from '../components/PostCard';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import styles from '../styles/Homepage.module.css';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Homepage = () => {
    const { t } = useTranslation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [latestPosts, setLatestPosts] = useState([]);
    const [postsError, setPostsError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchSessionStatus = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/status`, { credentials: 'include' });
                if (!response.ok) {
                    setIsLoggedIn(false);
                    return; 
                }
                const data = await response.json();
                setIsLoggedIn(data.valid);
            } catch (err) {
                setIsLoggedIn(false);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchLatestPosts = async () => {
            try {
                const response = await axiosInstance.get('/getAllPosts', { withCredentials: true });
                const sortedPosts = response.data?.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                ) || [];
                setLatestPosts(sortedPosts.slice(0, 3));
            } catch (error) {
                setPostsError(t('homepage.blogError'));
            }
        };

        fetchSessionStatus();
        fetchLatestPosts();
    }, [t]);

    const handleViewPostClick = (postId) => {
        navigate(`/blogs/view/${postId}`);
    };

    const handleHomepageTagClick = (tag) => {
        navigate(`/blogs?tag=${encodeURIComponent(tag)}`);
    };

    if (isLoading) {
        return <div className={styles.loadingPage}>{t('homepage.loading')}</div>;
    }

    if (isLoggedIn) {
        return (
            <>
                <GlucoseLog />
            </>
        );
    } else {
        return (
            <div className={styles.homepageContainer}>
                <div className={styles.heroSection}>
                    <h1 className={styles.title}>{t('homepage.heroTitle')}</h1>
                    <p className={styles.description}>
                        {t('homepage.heroDescription')}
                    </p>
                </div>

                <section className={styles.featuresOverviewSection}>
                    <h2 className={styles.sectionTitle}>{t('homepage.featuresTitle')}</h2>
                    <ul className={styles.featuresList}>
                        <li>{t('homepage.feature1')}</li>
                        <li>{t('homepage.feature2')}</li>
                        <li>{t('homepage.feature3')}</li>
                        <li>{t('homepage.feature4')}</li>
                        <li>{t('homepage.feature5')}</li>
                        <li>{t('homepage.feature6')}</li>
                    </ul>
                    <div className={styles.ctaButtonContainer}>
                        <button className={styles.ctaButton} onClick={() => navigate('/signUp')}>
                            {t('homepage.btnCreateAccount')}
                        </button>
                    </div>
                </section>

                <section className={styles.latestPostsSection}>
                    <h2 className={styles.sectionTitle}>{t('homepage.blogTitle')}</h2>
                    {postsError && <p className={styles.errorText}>{postsError}</p>}
                    {latestPosts.length > 0 ? (
                        <div className={styles.postsGrid}>
                            {latestPosts.map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    handleViewClick={() => handleViewPostClick(post.id)}
                                    isAdmin={false}
                                    selectedTags={[]}
                                    setSelectedTags={handleHomepageTagClick}
                                />
                            ))}
                        </div>
                    ) : (
                        !postsError && <p>{t('homepage.blogEmpty')}</p>
                    )}
                </section>
            </div>
        );
    }
};

export default Homepage;