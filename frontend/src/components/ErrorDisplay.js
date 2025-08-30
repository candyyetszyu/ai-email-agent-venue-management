import React from 'react';
import { Alert, Box, Button, Typography, Paper } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const ErrorDisplay = ({ error, onRetry }) => {
  // Extract error message from various error formats
  const getErrorMessage = () => {
    if (!error) return 'An unknown error occurred';
    
    if (typeof error === 'string') return error;
    
    if (error.response && error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    
    if (error.message) return error.message;
    
    return 'An unexpected error occurred';
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mt: 2, 
        mb: 2, 
        borderRadius: 2,
        backgroundColor: '#fff8f8' 
      }}
    >
      <Alert severity="error" sx={{ mb: 2 }}>
        Error
      </Alert>
      
      <Typography variant="h6" gutterBottom>
        Something went wrong
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        {getErrorMessage()}
      </Typography>
      
      {onRetry && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
          >
            Try Again
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ErrorDisplay;