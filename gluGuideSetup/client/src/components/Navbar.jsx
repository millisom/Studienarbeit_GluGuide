import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import axiosInstance from '../api/axiosConfig'; 
import styles from '../styles/NavBar.module.css'; 
import { useTranslation } from 'react-i18next'; 
import WorryModal from './WorryModal';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Navbar = () => {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation(); 

    const [pollingInterval, setPollingInterval] = useState(300000); 
    const [isWorryModalOpen, setWorryModalOpen] = useState(false);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const currentLanguage = i18n.language?.split('-')[0];


    useEffect(() => {
        if (!user) return;
        const checkActiveAlerts = async () => {
            try {
                const userId = user.id || user.userId;
                const response = await axiosInstance.get(`/alerts/${userId}`);
                if (response.data && response.data.length > 0) {
                    setPollingInterval(10000);
                } else {
                    setPollingInterval(300000);
                }
            } catch (error) {
                console.error("Failed to check active alerts:", error);
            }
        };
        checkActiveAlerts(); 
        const intervalId = setInterval(checkActiveAlerts, 300000);
        return () => clearInterval(intervalId);
    }, [user]);


    useEffect(() => {
        if (!user) return;
        const checkNotifications = async () => {
            try {
                const response = await axiosInstance.get('/notifications/unread');
                const unreadNotifs = response.data;
                if (unreadNotifs && unreadNotifs.length > 0) {
                    unreadNotifs.forEach(async (notif) => {


                        let metadata = null;
                        try {
                            metadata = JSON.parse(notif.message);
                        } catch {
                            metadata = null;
                        }

                        if (metadata && metadata.type === 'meal_reminder') {

                            toast.info(
                                ({ closeToast }) => (
                                    <div style={{ padding: '16px' }}>
                                        <strong style={{ fontSize: '1.4rem', color: '#2c3e50', display: 'block', marginBottom: '10px' }}>
                                            {notif.title}
                                        </strong>
                                        <p style={{ margin: '0 0 16px 0', fontSize: '1.1rem', lineHeight: '1.5', color: '#34495e' }}>
                                            {metadata.text}
                                        </p>
                                        <button
                                            onClick={() => {
                                                closeToast();
                                                navigate(`/?logGlucose=true&mealId=${metadata.meal_id}&readingType=1h_post_meal`);
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '12px 20px',
                                                backgroundColor: '#27ae60',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseOver={(e) => e.target.style.backgroundColor = '#219a52'}
                                            onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
                                        >
                                            {t('notification.btnLogNow', { defaultValue: 'Log glucose now' })}
                                        </button>
                                    </div>
                                ), 
                                {
                                    position: "top-center", 
                                    autoClose: false, 
                                    closeOnClick: false,
                                    draggable: false,
                                    theme: "light",
                                    style: { 
                                        width: '500px', 
                                        maxWidth: '90vw', 
                                        borderRadius: '16px',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
                                    }
                                }
                            );
                        } else {

                            const displayMessage = metadata?.text || notif.message;

                            toast.info(
                                <div style={{ padding: '20px' }}>
                                    <strong style={{ fontSize: '1.6rem', color: '#2c3e50' }}>{notif.title}</strong>
                                    <p style={{ margin: '15px 0 0 0', fontSize: '1.25rem', lineHeight: '1.5', color: '#34495e' }}>{displayMessage}</p>
                                </div>, 
                                {
                                    position: "top-center", 
                                    autoClose: false, 
                                    theme: "light",
                                    style: { width: '600px', maxWidth: '90vw', borderRadius: '16px' }
                                }
                            );
                        }

                        await axiosInstance.put(`/notifications/${notif.id}/read`);
                    });
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };
        checkNotifications();
        const intervalId = setInterval(checkNotifications, pollingInterval); 
        return () => clearInterval(intervalId);
    }, [user, pollingInterval, navigate, t]); 

    const handleLogout = async () => {
        try {
            await logout();
            toast.success(t('nav.logout_success'), { autoClose: 3000 });
            navigate('/'); 
        } catch (error) {
            console.error('Error during logout:', error);
            toast.error(t('nav.logout_error'), { autoClose: 3000 });
        }
    };

    return (
        <>
            <ToastContainer />
            <header className={styles.header}>
                <Link to="/" className={styles.logo}>GluGuide</Link>
                <nav className={styles.navbar}>
                    
                    <div className={styles.langSwitcher} style={{ display: 'flex', gap: '8px', marginRight: '15px', alignItems: 'center' }}>
                        <button 
                            onClick={() => changeLanguage('en')}
                            style={{ 
                                fontWeight: currentLanguage === 'en' ? 'bold' : 'normal',
                                color: currentLanguage === 'en' ? '#007bff' : '#555',
                                background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem'
                            }}
                        >EN</button>
                        <span style={{ color: '#ccc' }}>|</span>
                        <button 
                            onClick={() => changeLanguage('de')}
                            style={{ 
                                fontWeight: currentLanguage === 'de' ? 'bold' : 'normal',
                                color: currentLanguage === 'de' ? '#007bff' : '#555',
                                background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem'
                            }}
                        >DE</button>
                    </div>

                    {user ? (
                        <>
                            <Link to="/">{t('nav.logging')}</Link>
                            <Link to="/meals">{t('nav.meals')}</Link>
                            <Link to="/knowledge">{t('nav.knowledgeHub')}</Link>
                            <Link to="/blogs">{t('nav.blogs')}</Link>

                            <button 
                                className={styles.navButtonLink} 
                                onClick={() => setWorryModalOpen(true)}
                            >
                                {t('worryBox.title')}
                            </button>

                            <Link to="/account">{t('nav.account')}</Link>
                            {isAdmin && <Link to="/admin">{t('nav.admin')}</Link>}
                            <Link to="/about">{t('nav.about')}</Link>
                            <Link to="/contact">{t('nav.contact')}</Link>
                            <button className={styles.logoutButton} onClick={handleLogout}>
                                {t('nav.logout')}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/blogs">{t('nav.blogs')}</Link>
                            <Link to="/login">{t('nav.login')}</Link>
                            <Link to="/about">{t('nav.about')}</Link>
                            <Link to="/contact">{t('nav.contact')}</Link>
                        </>
                    )}
                </nav>
            </header>

            <WorryModal 
                isOpen={isWorryModalOpen} 
                onClose={() => setWorryModalOpen(false)} 
            />
        </>
    );
};

export default Navbar;
