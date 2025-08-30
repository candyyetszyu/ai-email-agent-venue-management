import React from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';

const ErrorMessage = ({ message, retry = null, goBack = null }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="50vh"
      p={3}
    >
      <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: 600 }}>
        {message || 'An error occurred. Please try again.'}
      </Alert>
      
      <Box mt={2} display="flex" gap={2}>
        {retry && (
          <Button variant="contained" color="primary" onClick={retry}>
            Try Again
          </Button>
        )}
        
        {goBack && (
          <Button variant="outlined" onClick={goBack}>
            Go Back
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ErrorMessage;