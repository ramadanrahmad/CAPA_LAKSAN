const express = require('express');
const passport = require('../config/passport');
const { oauthCallback } = require('../controllers/oauthController');

const router = express.Router();

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/auth?error=google_failed`,
    session: false,
  }),
  oauthCallback
);

module.exports = router;
