import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosConfig';


const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axiosInstance.get('/status', { withCredentials: true });
        if (response.data.loggedIn) {
          setUser(response.data.user);
          setIsAdmin(response.data.user.is_admin || false);
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
      const response = await axiosInstance.post('/login', credentials);

      if (response.data.user) {
          setUser(response.data.user);
          setIsAdmin(response.data.user.is_admin);
      } else {
          const statusRes = await axiosInstance.get('/status');
          setUser(statusRes.data.user);
          setIsAdmin(statusRes.data.user.is_admin);
      }
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.Message || 'Login failed' 
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


export const useAuth = () => {
  return useContext(AuthContext);
};