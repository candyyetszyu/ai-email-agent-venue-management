import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const AIContext = createContext();

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider = ({ children }) => {
  const { showToast } = useToast();
  
  const [aiResponses, setAiResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const detectLanguage = useCallback(async (provider, emailId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `/api/ai/detect-language`,
        { provider, emailId },
        { headers: getAuthHeader() }
      );

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to detect language';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, showToast]);

  const analyzeEmail = useCallback(async (provider, emailId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `/api/ai/analyze-email`,
        { provider, emailId },
        { headers: getAuthHeader() }
      );

      setAiResponses(prev => ({
        ...prev,
        [emailId]: {
          ...prev[emailId],
          analysis: response.data.analysis,
          detectedLanguage: response.data.language,
          confidence: response.data.confidence
        }
      }));

      showToast('Email analyzed successfully', 'success');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to analyze email';
      setError(errorMessage);
      setAiResponses(prev => ({
        ...prev,
        [emailId]: { ...prev[emailId], status: 'error', error: errorMessage }
      }));
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, showToast]);

  const generateResponse = useCallback(async (provider, emailId, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `/api/ai/generate-response`,
        { 
          provider, 
          emailId,
          tone: options.tone || 'professional',
          language: options.language || 'auto',
          includeCalendar: options.includeCalendar !== false,
          customPrompt: options.customPrompt
        },
        { headers: getAuthHeader() }
      );

      setAiResponses(prev => ({
        ...prev,
        [emailId]: {
          ...prev[emailId],
          response: response.data.response,
          confidence: response.data.confidence,
          warning: response.data.warning
        }
      }));

      showToast('Response generated successfully', 'success');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to generate response';
      setError(errorMessage);
      setAiResponses(prev => ({
        ...prev,
        [emailId]: { ...prev[emailId], status: 'error', error: errorMessage }
      }));
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, showToast]);

  const batchProcessEmails = useCallback(async (provider, emailIds, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `/api/ai/batch-process`,
        { 
          provider, 
          emailIds,
          includeAnalysis: options.includeAnalysis !== false,
          includeResponse: options.includeResponse !== false,
          tone: options.tone || 'professional'
        },
        { headers: getAuthHeader() }
      );

      // Update AI responses for all processed emails
      const processedResponses = response.data.results || {};
      setAiResponses(prev => ({
        ...prev,
        ...processedResponses
      }));

      const successCount = Object.values(processedResponses).filter(r => !r.error).length;
      showToast(`Batch processing completed: ${successCount}/${emailIds.length} emails processed`, 'success');
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to batch process emails';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, showToast]);

  const getModels = useCallback(async () => {
    try {
      const response = await axios.get('/api/ai/models', {
        headers: getAuthHeader()
      });

      setAvailableModels(response.data.models || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch AI models';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    }
  }, [getAuthHeader, showToast]);

  const getHealth = useCallback(async () => {
    try {
      const response = await axios.get('/api/ai/health', {
        headers: getAuthHeader()
      });

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'AI service health check failed';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    }
  }, [getAuthHeader, showToast]);

  const updateResponse = useCallback((emailId, updatedResponse) => {
    setAiResponses(prev => ({
      ...prev,
      [emailId]: {
        ...prev[emailId],
        response: updatedResponse,
        lastUpdated: new Date().toISOString()
      }
    }));
  }, []);

  const clearResponse = useCallback((emailId) => {
    setAiResponses(prev => {
      const newResponses = { ...prev };
      delete newResponses[emailId];
      return newResponses;
    });
  }, []);

  const clearAllResponses = useCallback(() => {
    setAiResponses({});
  }, []);

  const value = {
    aiResponses,
    loading,
    error,
    availableModels,
    detectLanguage,
    analyzeEmail,
    generateResponse,
    batchProcessEmails,
    getModels,
    getHealth,
    updateResponse,
    clearResponse,
    clearAllResponses
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

export default AIProvider;