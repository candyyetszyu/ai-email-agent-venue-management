import React, { createContext, useState, useContext } from 'react';
import Toast from '../components/Toast';

// Create context
const ToastContext = createContext(null);

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success', 'info', 'warning', 'error'
  });

  // Show toast notification
  const showToast = (message, severity = 'info') => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  // Hide toast notification
  const hideToast = () => {
    setToast({
      ...toast,
      open: false,
    });
  };

  // Convenience methods for different toast types
  const showSuccessToast = (message) => showToast(message, 'success');
  const showErrorToast = (message) => showToast(message, 'error');
  const showInfoToast = (message) => showToast(message, 'info');
  const showWarningToast = (message) => showToast(message, 'warning');

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccessToast,
        showErrorToast,
        showInfoToast,
        showWarningToast,
        hideToast,
      }}
    >
      {children}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};