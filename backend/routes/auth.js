const express = require('express');
const Joi = require('joi');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');
const { register, login, loginPetugas, logout, getProfile, updateProfile, verifyEmail, resendVerificationEmail } = require('../controllers/authController');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nama minimal 2 karakter',
    'string.max': 'Nama maksimal 100 karakter',
    'any.required': 'Nama wajib diisi',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Format email tidak valid',
    'any.required': 'Email wajib diisi',
  }),
  no_hp: Joi.string().allow('', null).messages({
    'string.base': 'Format Nomor HP tidak valid',
  }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password minimal 8 karakter',
      'string.max': 'Password maksimal 128 karakter',
      'string.pattern.base':
        'Password harus mengandung huruf besar, huruf kecil, dan angka',
      'any.required': 'Password wajib diisi',
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Konfirmasi password tidak cocok',
      'any.required': 'Konfirmasi password wajib diisi',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Format email tidak valid',
    'any.required': 'Email wajib diisi',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password wajib diisi',
  }),
});

const loginPetugasSchema = Joi.object({
  nip: Joi.string().required().messages({
    'any.required': 'NIP wajib diisi',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password wajib diisi',
  }),
});

// Routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/login-petugas', validate(loginPetugasSchema), loginPetugas);
router.post('/logout', logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
