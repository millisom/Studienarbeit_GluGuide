import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import axiosInstance from '../api/axiosConfig'; 
import styles from '../styles/NavBar.module.css'; 

// 1. Import Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Navbar = () => {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        const checkNotifications = async () => {
            try {
                const response = await axiosInstance.get('/notifications/unread');
                const unreadNotifs = response.data;

                if (unreadNotifs && unreadNotifs.length > 0) {
                    unreadNotifs.forEach(async (notif) => {
                        
       
                        toast.info(
                            <div>
                                <strong style={{ fontSize: '1.1rem' }}>{notif.title}</strong>
                                <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem' }}>{notif.message}</p>
                            </div>, 
                            {
                                position: "top-right",
                                autoClose: false, 
                                closeOnClick: false,
                                pauseOnHover: true,
                                draggable: true,
                                theme: "light",
                            }
                        );


                        await axiosInstance.put(`/notifications/${notif.id}/read`);
                    });
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        checkNotifications();
        const intervalId = setInterval(checkNotifications, 60000); 

        return () => clearInterval(intervalId);
    }, [user]);


    const handleLogout = async () => {
        try {
            await logout();

            toast.success('You have been logged out successfully.', { autoClose: 3000 });
            navigate('/'); 
        } catch (error) {
            console.error('Error during logout:', error);
            toast.error('Failed to log out. Please try again.', { autoClose: 3000 });
        }
    };

    return (
        <>
            <ToastContainer />

            <header className={styles.header}>
                <Link to="/" className={styles.logo}>GluGuide</Link>
                <nav className={styles.navbar}>
                    
                    {user ? (
                        <>
                            <Link to="/">Logging</Link>
                            <Link to="/meals">Meals</Link>
                            <Link to="/blogs">Blogs</Link>
                            <Link to="/account">My Account</Link>
                            {isAdmin && <Link to="/admin">Admin Dashboard</Link>}
                            <Link to="/about">About</Link>
                            <Link to="/contact">Contact Us</Link>
                            <button 
                                className={styles.logoutButton} 
                                onClick={handleLogout}
                            >
                                Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/blogs">Blogs</Link>
                            <Link to="/login">Log In / Register</Link>
                            <Link to="/about">About</Link>
                            <Link to="/contact">Contact Us</Link>
                        </>
                    )}
                </nav>
            </header>
        </>
    );
};

export default Navbar;