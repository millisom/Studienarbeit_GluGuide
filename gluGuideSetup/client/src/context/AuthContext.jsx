import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosConfig';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hilfsfunktion zum Setzen der User-Daten (DRY - Don't Repeat Yourself)
  const handleAuthSuccess = (data) => {
    const userData = {
      id: data.userId || data.id, // WICHTIG: Die ID muss hier mit rein!
      username: data.username,
      is_admin: data.is_admin
    };
    setUser(userData);
    setIsAdmin(data.is_admin || false);
  };

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axiosInstance.get('/status', { withCredentials: true });

        if (response.data.valid) {
          handleAuthSuccess(response.data);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  const login = async (credentials) => {
    try {
      await axiosInstance.post('/login', credentials);
      const statusRes = await axiosInstance.get('/status');

      if (statusRes.data.valid) {
        handleAuthSuccess(statusRes.data);
        return { success: true };
      }
      
      return { success: false, message: 'Session could not be validated' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/logout');
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);