const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;

// Import user model (to be created later)
// const User = require('../models/User');

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: [
        'profile', 
        'email', 
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/gmail.compose'
      ]
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Store user info and tokens in database
        // For now, just pass the profile and tokens
        return done(null, {
          profile,
          accessToken,
          refreshToken
        });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Microsoft OAuth Strategy (for Outlook)
passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: process.env.MICROSOFT_CALLBACK_URL,
      scope: ['user.read', 'calendars.read', 'mail.send']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Store user info and tokens in database
        // For now, just pass the profile and tokens
        return done(null, {
          profile,
          accessToken,
          refreshToken
        });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
  done(null, user);
});