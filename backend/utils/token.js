const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token
 */
const generateToken = (user, role = 'user') => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email, // bisa undefined untuk petugas
      nip: user.nip,     // bisa undefined untuk user
      name: user.name || user.nama,
      role: role,
      petugas_role: user.petugas_role || user.role, // Some parts use .role instead of .petugas_role inside Petugas.js output
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
