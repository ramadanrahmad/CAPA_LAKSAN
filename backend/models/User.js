const pool = require('../config/db');

const User = {
  /**
   * Find user by email
   */
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, no_hp, avatar, provider, email_verified, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Find user by provider and provider_id
   */
  async findByProviderId(provider, providerId) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
      [provider, providerId]
    );
    return rows[0] || null;
  },

  /**
   * Create a new user
   */
  async create(userData) {
    const { name, email, no_hp, password, avatar, provider, provider_id, email_verified } = userData;

    const [result] = await pool.query(
      `INSERT INTO users (name, email, no_hp, password, avatar, provider, provider_id, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        no_hp || null,
        password || null,
        avatar || null,
        provider || 'local',
        provider_id || null,
        email_verified || false,
      ]
    );

    return { id: result.insertId, name, email, no_hp, avatar, provider };
  },

  /**
   * Update reset token for password recovery
   */
  async updateResetToken(email, token, expires) {
    const [result] = await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
      [token, expires, email]
    );
    return result.affectedRows > 0;
  },

  /**
   * Find user by reset token (valid, not expired)
   */
  async findByResetToken(token) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    return rows[0] || null;
  },

  /**
   * Reset password and clear reset token
   */
  async resetPassword(userId, hashedPassword) {
    const [result] = await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, userId]
    );
    return result.affectedRows > 0;
  },

  /**
   * Update user password
   */
  async updatePassword(userId, hashedPassword) {
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    return result.affectedRows > 0;
  },

  /**
   * Update user profile (name, no_hp, and optionally password)
   */
  async updateProfile(id, name, no_hp, hashedPassword) {
    if (hashedPassword) {
      const [result] = await pool.query(
        'UPDATE users SET name = ?, no_hp = ?, password = ? WHERE id = ?',
        [name, no_hp, hashedPassword, id]
      );
      return result.affectedRows > 0;
    } else {
      const [result] = await pool.query(
        'UPDATE users SET name = ?, no_hp = ? WHERE id = ?',
        [name, no_hp, id]
      );
      return result.affectedRows > 0;
    }
  },

  /**
   * Update verification token
   */
  async updateVerificationToken(email, token, expires) {
    const [result] = await pool.query(
      'UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE email = ?',
      [token, expires, email]
    );
    return result.affectedRows > 0;
  },

  /**
   * Find user by verification token
   */
  async findByVerificationToken(token) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE verification_token = ? AND verification_token_expires > NOW()',
      [token]
    );
    return rows[0] || null;
  },

  /**
   * Set user email as verified
   */
  async verifyEmail(userId) {
    const [result] = await pool.query(
      'UPDATE users SET email_verified = 1, verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = User;
