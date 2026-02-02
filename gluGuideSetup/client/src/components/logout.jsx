import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/BlogCard.module.css';
import { useAuth } from '../context/AuthContext'; 

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      alert('You have been logged out successfully.');
      navigate('/'); 
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  return (
    <button className={styles.squareButton} onClick={handleLogout}>Logout</button>
  );
};

export default Logout;