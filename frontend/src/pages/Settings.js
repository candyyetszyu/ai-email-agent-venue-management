import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Switch,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { 
  Google as GoogleIcon, 
  Microsoft as MicrosoftIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AccountStatus from '../components/AccountStatus';
import UserPreferences from '../components/UserPreferences';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Account connection status
  const [googleConnected, setGoogleConnected] = useState(false);
  const [microsoftConnected, setMicrosoftConnected] = useState(false);
  
  // Settings
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [defaultEmailProvider, setDefaultEmailProvider] = useState('gmail');
  
  useEffect(() => {
    // Check if user has connected accounts
    if (user) {
      setGoogleConnected(!!user.googleToken);
      setMicrosoftConnected(!!user.microsoftToken);
      
      // Load user preferences from localStorage
      const savedAutoAnalyze = localStorage.getItem('autoAnalyze');
      const savedDefaultProvider = localStorage.getItem('defaultEmailProvider');
      
      if (savedAutoAnalyze !== null) {
        setAutoAnalyze(savedAutoAnalyze === 'true');
      }
      
      if (savedDefaultProvider) {
        setDefaultEmailProvider(savedDefaultProvider);
      }
    }
  }, [user]);
  
  const handleConnectGoogle = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = '/api/auth/google';
  };
  
  const handleConnectMicrosoft = () => {
    // Redirect to Microsoft OAuth endpoint
    window.location.href = '/api/auth/microsoft';
  };
  
  const handleDisconnectGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API to revoke Google token
      const response = await fetch('/api/auth/google/revoke', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect Google account');
      }
      
      setGoogleConnected(false);
      setSuccess('Google account disconnected successfully');
      
      // If this was the default provider, switch to Microsoft if connected
      if (defaultEmailProvider === 'gmail' && microsoftConnected) {
        setDefaultEmailProvider('outlook');
        localStorage.setItem('defaultEmailProvider', 'outlook');
      }
      
      // Force refresh of user context
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      console.error('Error disconnecting Google account:', err);
      setError(err.message || 'Failed to disconnect Google account');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDisconnectMicrosoft = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API to revoke Microsoft token
      const response = await fetch('/api/auth/microsoft/revoke', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect Microsoft account');
      }
      
      setMicrosoftConnected(false);
      setSuccess('Microsoft account disconnected successfully');
      
      // If this was the default provider, switch to Google if connected
      if (defaultEmailProvider === 'outlook' && googleConnected) {
        setDefaultEmailProvider('gmail');
        localStorage.setItem('defaultEmailProvider', 'gmail');
      }
      
      // Force refresh of user context
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      console.error('Error disconnecting Microsoft account:', err);
      setError(err.message || 'Failed to disconnect Microsoft account');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAutoAnalyzeChange = (event) => {
    const newValue = event.target.checked;
    setAutoAnalyze(newValue);
    localStorage.setItem('autoAnalyze', newValue.toString());
    setSuccess('Settings saved successfully');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };
  
  const handleDefaultProviderChange = (provider) => {
    setDefaultEmailProvider(provider);
    localStorage.setItem('defaultEmailProvider', provider);
    setSuccess('Default email provider updated');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };
  
  const handleLogout = () => {
    logout();
    // Redirect to login page happens in the AuthContext
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Connected Accounts */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Connected Accounts
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  {/* Google Account */}
                  <ListItem>
                    <ListItemIcon>
                      <GoogleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Google Account" 
                      secondary={googleConnected ? 'Connected' : 'Not connected'} 
                    />
                    <ListItemSecondaryAction>
                      {googleConnected ? (
                        <Button 
                          variant="outlined" 
                          color="error" 
                          onClick={handleDisconnectGoogle}
                          disabled={loading}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          onClick={handleConnectGoogle}
                          disabled={loading}
                          startIcon={<GoogleIcon />}
                        >
                          Connect
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  {/* Microsoft Account */}
                  <ListItem>
                    <ListItemIcon>
                      <MicrosoftIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Microsoft Account" 
                      secondary={microsoftConnected ? 'Connected' : 'Not connected'} 
                    />
                    <ListItemSecondaryAction>
                      {microsoftConnected ? (
                        <Button 
                          variant="outlined" 
                          color="error" 
                          onClick={handleDisconnectMicrosoft}
                          disabled={loading}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          onClick={handleConnectMicrosoft}
                          disabled={loading}
                          startIcon={<MicrosoftIcon />}
                        >
                          Connect
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                
                {loading && (
                  <Box display="flex" justifyContent="center" mt={2}>
                    <CircularProgress size={24} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Preferences */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Preferences
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  {/* Auto-analyze setting */}
                  <ListItem>
                    <ListItemText 
                      primary="Auto-analyze emails" 
                      secondary="Automatically analyze emails when viewing them" 
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={autoAnalyze}
                        onChange={handleAutoAnalyzeChange}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  {/* Default email provider */}
                  <ListItem>
                    <ListItemText 
                      primary="Default Email Provider" 
                      secondary="Select which email provider to use by default" 
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant={defaultEmailProvider === 'gmail' ? 'contained' : 'outlined'}
                          color="primary"
                          onClick={() => handleDefaultProviderChange('gmail')}
                          disabled={!googleConnected}
                          size="small"
                        >
                          Gmail
                        </Button>
                        <Button 
                          variant={defaultEmailProvider === 'outlook' ? 'contained' : 'outlined'}
                          color="primary"
                          onClick={() => handleDefaultProviderChange('outlook')}
                          disabled={!microsoftConnected}
                          size="small"
                        >
                          Outlook
                        </Button>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Account Actions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" justifyContent="flex-end">
                  <Button 
                    variant="contained" 
                    color="error"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Settings;