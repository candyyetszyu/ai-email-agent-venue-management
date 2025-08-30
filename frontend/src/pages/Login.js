import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Typography,
  Container,
  Paper,
  Box,
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is already logged in
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleLogin = () => {
    login('google');
  };

  const handleMicrosoftLogin = () => {
    login('microsoft');
  };

  return (
    <Container maxWidth="sm" className="auth-container">
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Email Agent
        </Typography>
        <Typography variant="body1" align="center" paragraph>
          Connect to your email and calendar to streamline venue booking responses
        </Typography>

        <Box className="auth-buttons">
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleGoogleLogin}
            size="large"
          >
            Sign in with Google
          </Button>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleMicrosoftLogin}
            size="large"
          >
            Sign in with Microsoft
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;