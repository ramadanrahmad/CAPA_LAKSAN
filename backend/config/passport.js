const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
require('dotenv').config();

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findByProviderId('google', profile.id);

          if (!user) {
            // Check if email already exists with local provider
            const existingUser = await User.findByEmail(
              profile.emails[0].value
            );
            if (existingUser) {
              // Link Google to existing account
              user = existingUser;
            } else {
              // Create new user
              user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0]?.value || null,
                provider: 'google',
                provider_id: profile.id,
                email_verified: true,
              });
            }
          }

          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
  console.log('✅ Google OAuth strategy configured');
} else {
  console.log('⚠️  Google OAuth not configured (set GOOGLE_CLIENT_ID in .env)');
}

module.exports = passport;
