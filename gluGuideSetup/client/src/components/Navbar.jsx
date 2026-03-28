import React, { useEffect, useState } from 'react';
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

    // 🔥 NEW: State to control how fast we check for popups. Default is Eco Mode (5 mins)
    const [pollingInterval, setPollingInterval] = useState(300000); 

    // 🔥 NEW EFFECT: The "Smart Check" to see if we need Fast Mode or Eco Mode
    useEffect(() => {
        if (!user) return;

        const checkActiveAlerts = async () => {
            try {
                const userId = user.id || user.userId;
                const response = await axiosInstance.get(`/alerts/${userId}`);
                
                // If they have alerts scheduled, poll every 10 seconds (Fast Mode)
                // If not, fall back to checking every 5 minutes (Eco Mode)
                if (response.data && response.data.length > 0) {
                    setPollingInterval(10000);
                } else {
                    setPollingInterval(300000);
                }
            } catch (error) {
                console.error("Failed to check active alerts:", error);
            }
        };

        checkActiveAlerts(); // Check immediately on load
        
        // Re-check their alert schedule every 5 minutes in case they added a new one
        const intervalId = setInterval(checkActiveAlerts, 300000);
        return () => clearInterval(intervalId);
    }, [user]);

    // EXISTING EFFECT: Actually fetch the notifications
    useEffect(() => {
        if (!user) return;

        const checkNotifications = async () => {
            try {
                const response = await axiosInstance.get('/notifications/unread');
                const unreadNotifs = response.data;

                if (unreadNotifs && unreadNotifs.length > 0) {
                    unreadNotifs.forEach(async (notif) => {
                        
  
                        toast.info(
                            <div style={{ padding: '20px' }}>
                                <strong style={{ fontSize: '1.6rem', color: '#2c3e50' }}>{notif.title}</strong>
                                <p style={{ margin: '15px 0 0 0', fontSize: '1.25rem', lineHeight: '1.5', color: '#34495e' }}>{notif.message}</p>
                            </div>, 
                            {
                                position: "top-center", 
                                autoClose: false, 
                                closeOnClick: false,
                                pauseOnHover: true,
                                draggable: true,
                                theme: "light",
                                style: { 
                                    width: '600px', 
                                    maxWidth: '90vw', 
                                    borderRadius: '16px',
                                    boxShadow: '0 12px 30px rgba(0,0,0,2)' 
                                }
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
        

        const intervalId = setInterval(checkNotifications, pollingInterval); 

        return () => clearInterval(intervalId);
    }, [user, pollingInterval]); 


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