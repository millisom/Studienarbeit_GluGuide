import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import styles from '../styles/NavBar.module.css'; 

const Navbar = () => {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            alert('You have been logged out successfully.');
            navigate('/'); 
        } catch (error) {
            console.error('Error during logout:', error);
            alert('Failed to log out. Please try again.');
        }
    };

    return (
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
    );
};

export default Navbar;