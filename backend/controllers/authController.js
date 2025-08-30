const jwt = require('jsonwebtoken');
const { google } = require('googleapis');

/**
 * Generate a JWT token for the user
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      provider: user.provider,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

/**
 * Handle Google OAuth callback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.googleCallback = (req, res) => {
  try {
    // User should be available from passport
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
    }

    // Generate JWT token
    const token = generateToken(req.user);

    // Redirect to frontend with token
    return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=google`);
  } catch (error) {
    console.error('Error in Google callback:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
  }
};

/**
 * Handle Microsoft OAuth callback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.microsoftCallback = (req, res) => {
  try {
    // User should be available from passport
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
    }

    // Generate JWT token
    const token = generateToken(req.user);

    // Redirect to frontend with token
    return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=microsoft`);
  } catch (error) {
    console.error('Error in Microsoft callback:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
  }
};

/**
 * Verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.verifyToken = (req, res) => {
  try {
    // Get token from authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Return user info
    return res.json({
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        provider: decoded.provider,
      },
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Get Google OAuth2 client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getGoogleOAuth2Client = (req, res, next) => {
  try {
    // Get token from authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if provider is Google
    if (decoded.provider !== 'google') {
      return res.status(401).json({ error: 'Invalid provider' });
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/auth/google/callback`
    );

    // Set credentials
    oauth2Client.setCredentials({
      access_token: req.user.accessToken,
      refresh_token: req.user.refreshToken,
    });

    // Add OAuth2 client to request
    req.oauth2Client = oauth2Client;
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Error getting Google OAuth2 client:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Get Microsoft Graph client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getMicrosoftGraphClient = (req, res, next) => {
  try {
    // Get token from authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if provider is Microsoft
    if (decoded.provider !== 'microsoft') {
      return res.status(401).json({ error: 'Invalid provider' });
    }

    // Add MSAL token to request
    req.msalToken = req.user.accessToken;
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Error getting Microsoft Graph client:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};