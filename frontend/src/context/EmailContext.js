import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { useToast } from './ToastContext';

const EmailContext = createContext();

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
};

export const EmailProvider = ({ children }) => {
  const { showToast } = useToast();
  
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEmails: 0,
    unreadEmails: 0,
    bookingEmails: 0,
    processedEmails: 0
  });
  const [selectedProvider, setSelectedProvider] = useState('gmail');

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const fetchEmails = useCallback(async (provider = selectedProvider, filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      if (filters.filter) params.append('filter', filters.filter);
      if (filters.search) params.append('search', filters.search);
      if (filters.from) params.append('from', filters.from.toISOString());
      if (filters.to) params.append('to', filters.to.toISOString());
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await axios.get(`/api/email/${provider}/messages?${params}`, {
        headers: getAuthHeader(),
      });

      setEmails(response.data.emails || response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch emails';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedProvider, getAuthHeader, showToast]);

  const fetchStats = useCallback(async (provider = selectedProvider) => {
    try {
      const response = await axios.get(`/api/email/${provider}/stats`, {
        headers: getAuthHeader(),
      });

      setStats(response.data.stats || response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch email stats';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, [selectedProvider, getAuthHeader, showToast]);

  const sendEmail = useCallback(async (provider, emailData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`/api/email/${provider}/send`, emailData, {
        headers: getAuthHeader(),
      });

      showToast('Email sent successfully', 'success');
      
      // Refresh emails after sending
      await fetchEmails(provider);
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send email';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, showToast, fetchEmails]);

  const markAsRead = useCallback(async (provider, emailId) => {
    try {
      const response = await axios.post(`/api/email/${provider}/messages/${emailId}/read`, {}, {
        headers: getAuthHeader(),
      });

      // Update local state
      setEmails(prev => prev.map(email => 
        email.id === emailId ? { ...email, isUnread: false } : email
      ));

      return response.data;
    } catch (err) {
      showToast('Failed to mark email as read', 'error');
      throw err;
    }
  }, [getAuthHeader, showToast]);

  const deleteEmail = useCallback(async (provider, emailId) => {
    try {
      const response = await axios.delete(`/api/email/${provider}/messages/${emailId}`, {
        headers: getAuthHeader(),
      });

      // Update local state
      setEmails(prev => prev.filter(email => email.id !== emailId));
      
      showToast('Email deleted successfully', 'success');
      return response.data;
    } catch (err) {
      showToast('Failed to delete email', 'error');
      throw err;
    }
  }, [getAuthHeader, showToast]);

  const searchEmails = useCallback(async (provider, query, filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ q: query });
      
      if (filters.type) params.append('type', filters.type);
      if (filters.from) params.append('from', filters.from.toISOString());
      if (filters.to) params.append('to', filters.to.toISOString());

      const response = await axios.get(`/api/email/${provider}/search?${params}`, {
        headers: getAuthHeader(),
      });

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to search emails';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, showToast]);

  const downloadAttachment = useCallback(async (provider, messageId, attachmentId) => {
    try {
      const response = await axios.get(
        `/api/email/${provider}/messages/${messageId}/attachments/${attachmentId}`,
        {
          headers: getAuthHeader(),
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachmentId);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (err) {
      showToast('Failed to download attachment', 'error');
      throw err;
    }
  }, [getAuthHeader, showToast]);

  const value = {
    emails,
    loading,
    error,
    stats,
    selectedProvider,
    setSelectedProvider,
    fetchEmails,
    fetchStats,
    sendEmail,
    markAsRead,
    deleteEmail,
    searchEmails,
    downloadAttachment
  };

  return (
    <EmailContext.Provider value={value}>
      {children}
    </EmailContext.Provider>
  );
};

export default EmailProvider;