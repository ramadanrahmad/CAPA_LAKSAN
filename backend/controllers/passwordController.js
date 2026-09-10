const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Petugas = require('../models/Petugas');
const { sendResetEmail } = require('../utils/email');

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findByEmail(email);
    let isPetugas = false;

    if (!user) {
      user = await Petugas.findByEmail(email);
      if (user) isPetugas = true;
    }

    // Always return success to prevent email enumeration
    if (!user || (user.provider && user.provider !== 'local')) {
      return res.json({
        success: true,
        message: 'Jika email terdaftar, kami telah mengirim link reset password.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiry to 1 hour from now
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    if (isPetugas) {
      await Petugas.updateResetToken(email, hashedToken, expires);
    } else {
      await User.updateResetToken(email, hashedToken, expires);
    }

    // Send Reset Email
    try {
      let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      if (req.headers.referer) {
        frontendUrl = new URL(req.headers.referer).origin;
      } else if (req.headers.origin) {
        frontendUrl = req.headers.origin;
      }
      await sendResetEmail(email, resetToken, frontendUrl);
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Still return success - don't reveal if email was sent
    }

    res.json({
      success: true,
      message: 'Jika email terdaftar, kami telah mengirim link reset password.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi.',
    });
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password/:token
 */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    let user = await User.findByResetToken(hashedToken);
    let isPetugas = false;

    if (!user) {
      user = await Petugas.findByResetToken(hashedToken);
      if (user) isPetugas = true;
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token tidak valid atau sudah expired.',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (isPetugas) {
      await Petugas.resetPassword(user.id, hashedPassword);
    } else {
      await User.resetPassword(user.id, hashedPassword);
    }

    res.json({
      success: true,
      message: 'Password berhasil direset! Silakan login dengan password baru.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi.',
    });
  }
};

module.exports = { forgotPassword, resetPassword };
