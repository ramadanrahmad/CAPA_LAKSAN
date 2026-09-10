const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Petugas = require('../models/Petugas');
const { generateToken } = require('../utils/token');
const { sendVerificationEmail } = require('../utils/email');
const pool = require('../config/db');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, no_hp, password } = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan login.',
      });
    }

    // Check if email is used by a petugas
    const [existingPetugas] = await pool.query('SELECT id FROM petugas WHERE email = ?', [email]);
    if (existingPetugas.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar sebagai petugas. Silakan gunakan email lain.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      no_hp,
      password: hashedPassword,
      provider: 'local',
    });

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hours
    
    await User.updateVerificationToken(email, verificationToken, expires);

    // Send Verification Email
    try {
      let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      if (req.headers.referer) {
        frontendUrl = new URL(req.headers.referer).origin;
      } else if (req.headers.origin) {
        frontendUrl = req.headers.origin;
      }
      await sendVerificationEmail(email, verificationToken, frontendUrl);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // We still return success but maybe log it
    }

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi atau langsung login.',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi.',
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    // Check if user registered with OAuth
    if (user.provider !== 'local' && !user.password) {
      return res.status(401).json({
        success: false,
        message: `Akun ini terdaftar melalui ${user.provider}. Silakan login menggunakan ${user.provider}.`,
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    // Generate JWT
    const token = generateToken(user, 'user');

    // Set session
    req.session.userId = user.id;

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Login berhasil!',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          provider: user.provider,
          email_verified: user.email_verified,
          role: 'user',
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi.',
    });
  }
};

/**
 * Login Petugas
 * POST /api/auth/login-petugas
 */
const loginPetugas = async (req, res) => {
  try {
    const { nip, password } = req.body;

    // Find petugas
    const petugas = await Petugas.findByNip(nip);
    if (!petugas) {
      return res.status(401).json({
        success: false,
        message: 'NIP atau password salah.',
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, petugas.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'NIP atau password salah.',
      });
    }

    // Generate JWT
    const token = generateToken(petugas, 'petugas');

    // Set session
    req.session.userId = petugas.id;

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Login Petugas berhasil!',
      data: {
        user: {
          id: petugas.id,
          nip: petugas.nip,
          name: petugas.nama,
          email: petugas.email,
          role: 'petugas',
          petugas_role: petugas.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login petugas error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi.',
    });
  }
};

/**
 * Logout user/petugas
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
    }
  });

  res.clearCookie('token');
  res.clearCookie('connect.sid');

  res.json({
    success: true,
    message: 'Logout berhasil!',
  });
};

/**
 * Get current profile (User or Petugas)
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    
    if (role === 'petugas') {
      const petugas = await Petugas.findById(id);
      if (!petugas) {
        return res.status(404).json({ success: false, message: 'Petugas tidak ditemukan.' });
      }
      return res.json({
        success: true,
        data: { user: { id: petugas.id, nip: petugas.nip, name: petugas.nama, email: petugas.email, role: 'petugas', petugas_role: petugas.role } },
      });
    }

    // Default to user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    res.json({
      success: true,
      data: { user: { ...user, role: 'user' } },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
    });
  }
};

/**
 * Update current profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { name, no_hp, password } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama tidak boleh kosong.' });
    }

    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(12);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    if (role === 'petugas') {
      await Petugas.updateProfile(id, name, no_hp, hashedPassword);
    } else {
      // Current User model doesn't have no_hp parameter in updateProfile yet. Wait, I should add no_hp to User.updateProfile.
      await User.updateProfile(id, name, no_hp, hashedPassword);
    }

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui.',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui profil.',
    });
  }
};

/**
 * Verify Email
 * GET /api/auth/verify-email/:token
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findByVerificationToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Link verifikasi tidak valid atau sudah kadaluarsa.',
      });
    }

    await User.verifyEmail(user.id);

    res.json({
      success: true,
      message: 'Email berhasil diverifikasi.',
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
    });
  }
};

/**
 * Resend Verification Email
 * POST /api/auth/resend-verification
 */
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email tidak terdaftar.',
      });
    }

    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terverifikasi.',
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    
    await User.updateVerificationToken(email, verificationToken, expires);
    await sendVerificationEmail(email, verificationToken);

    res.json({
      success: true,
      message: 'Email verifikasi telah dikirim ulang.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat mengirim email.',
    });
  }
};

module.exports = { register, login, loginPetugas, logout, getProfile, updateProfile, verifyEmail, resendVerificationEmail };
