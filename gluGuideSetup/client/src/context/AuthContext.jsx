import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosConfig';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axiosInstance.get('/status', { withCredentials: true });

        if (response.data.valid) {
          setUser({
            username: response.data.username,
            is_admin: response.data.is_admin
          });
          setIsAdmin(response.data.is_admin || false);
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
        const userData = {
          username: statusRes.data.username,
          is_admin: statusRes.data.is_admin
        };
        setUser(userData);
        setIsAdmin(statusRes.data.is_admin);
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