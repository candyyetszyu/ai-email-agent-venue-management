import React from 'react';
import { Box, Typography, Paper, Button, Chip } from '@mui/material';
import { Google, Microsoft } from '@mui/icons-material';

const AccountStatus = ({ 
  googleConnected = false, 
  microsoftConnected = false,
  onConnectGoogle,
  onConnectMicrosoft,
  onDisconnectGoogle,
  onDisconnectMicrosoft
}) => {
  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Connected Accounts
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        {/* Google Account */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Google color="error" sx={{ mr: 1 }} />
            <Typography variant="body1">Google Account</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip 
              label={googleConnected ? 'Connected' : 'Not Connected'} 
              color={googleConnected ? 'success' : 'default'}
              size="small"
              sx={{ mr: 1 }}
            />
            
            {googleConnected ? (
              <Button 
                variant="outlined" 
                color="error" 
                size="small"
                onClick={onDisconnectGoogle}
              >
                Disconnect
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                onClick={onConnectGoogle}
              >
                Connect
              </Button>
            )}
          </Box>
        </Box>
        
        {/* Microsoft Account */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Microsoft color="primary" sx={{ mr: 1 }} />
            <Typography variant="body1">Microsoft Account</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip 
              label={microsoftConnected ? 'Connected' : 'Not Connected'} 
              color={microsoftConnected ? 'success' : 'default'}
              size="small"
              sx={{ mr: 1 }}
            />
            
            {microsoftConnected ? (
              <Button 
                variant="outlined" 
                color="error" 
                size="small"
                onClick={onDisconnectMicrosoft}
              >
                Disconnect
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                onClick={onConnectMicrosoft}
              >
                Connect
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default AccountStatus;