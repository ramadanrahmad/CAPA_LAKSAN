const { generateToken } = require('../utils/token');

/**
 * Handle OAuth callback success
 * Redirects to frontend with token
 */
const oauthCallback = (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/auth?error=oauth_failed`
      );
    }

    const token = generateToken(req.user);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend with token in URL
    res.redirect(`${process.env.FRONTEND_URL}/oauth/callback?token=${token}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth?error=oauth_error`);
  }
};

module.exports = { oauthCallback };
