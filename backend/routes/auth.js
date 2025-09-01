import { Hono } from 'hono';
import jwt from 'jsonwebtoken';

const router = new Hono();

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name,
      provider: user.provider,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

// Google OAuth routes - redirect to Google OAuth
router.get('/google', (c) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email')}&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  return c.redirect(googleAuthUrl);
});

// Google OAuth callback
router.get('/google/callback', async (c) => {
  try {
    const code = c.req.query('code');
    if (!code) {
      return c.redirect(`https://ai-email-agent-frontend.pages.dev/login?error=No authorization code`);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo = await userResponse.json();

    // Generate JWT token
    const user = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      provider: 'google',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };

    const token = generateToken(user);
    return c.redirect(`https://ai-email-agent-frontend.pages.dev/auth/callback?token=${token}&provider=google`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return c.redirect(`https://ai-email-agent-frontend.pages.dev/login?error=Authentication failed`);
  }
});

// Microsoft OAuth routes - redirect to Microsoft OAuth
router.get('/microsoft', (c) => {
  const microsoftAuthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
    `client_id=${process.env.MICROSOFT_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.MICROSOFT_REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Calendars.Read https://graph.microsoft.com/User.Read')}&` +
    `response_mode=query`;
  
  return c.redirect(microsoftAuthUrl);
});

// Microsoft OAuth callback
router.get('/microsoft/callback', async (c) => {
  try {
    const code = c.req.query('code');
    if (!code) {
      return c.redirect(`https://ai-email-agent-frontend.pages.dev/login?error=No authorization code`);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo = await userResponse.json();

    // Generate JWT token
    const user = {
      id: userInfo.id,
      email: userInfo.mail || userInfo.userPrincipalName,
      name: userInfo.displayName,
      provider: 'microsoft',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };

    const token = generateToken(user);
    return c.redirect(`https://ai-email-agent-frontend.pages.dev/auth/callback?token=${token}&provider=microsoft`);
  } catch (error) {
    console.error('Microsoft OAuth callback error:', error);
    return c.redirect(`https://ai-email-agent-frontend.pages.dev/login?error=Authentication failed`);
  }
});

// Verify token route
router.get('/verify', (c) => {
  const token = c.req.header('authorization')?.split(' ')[1];
  
  if (!token) {
    return c.json({ message: 'No token provided' }, 401);
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return c.json({ user: decoded });
  } catch (err) {
    return c.json({ message: 'Invalid token' }, 401);
  }
});

// Logout route
router.get('/logout', (c) => {
  // Since we're using JWT, we don't need to do anything server-side
  // The client will handle removing the token
  return c.json({ message: 'Logged out successfully' });
});

export default router;