import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setLoading(false);
          return;
        }

        // Verify token with backend
        const res = await axios.get('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data.user);
        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        localStorage.removeItem('token');
        setError('Authentication failed. Please log in again.');
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login user
  const login = (provider) => {
    window.location.href = `/api/auth/${provider}`;
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Set token after OAuth callback
  const setToken = (token) => {
    localStorage.setItem('token', token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};