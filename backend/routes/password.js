const express = require('express');
const Joi = require('joi');
const validate = require('../middleware/validate');
const { forgotPassword, resetPassword } = require('../controllers/passwordController');

const router = express.Router();

// Validation schemas
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Format email tidak valid',
    'any.required': 'Email wajib diisi',
  }),
});

const resetPasswordSchema = Joi.object({
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

// Routes
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);

module.exports = router;
