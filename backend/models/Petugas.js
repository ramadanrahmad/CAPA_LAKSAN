const pool = require('../config/db');

const Petugas = {
  /**
   * Find petugas by NIP
   */
  async findByNip(nip) {
    const [rows] = await pool.query('SELECT * FROM petugas WHERE nip = ?', [nip]);
    return rows[0] || null;
  },

  /**
   * Find petugas by Email
   */
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM petugas WHERE email = ?', [email]);
    return rows[0] || null;
  },

  /**
   * Find petugas by ID
   */
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, nip, nama, email, no_hp, role, created_at FROM petugas WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Find all petugas by role
   */
  async findByRole(role) {
    const [rows] = await pool.query(
      'SELECT id, nip, nama, email, role FROM petugas WHERE role = ? ORDER BY nama ASC',
      [role]
    );
    return rows;
  },

  /**
   * Update petugas profile (nama, no_hp and optionally password)
   */
  async updateProfile(id, nama, no_hp, hashedPassword) {
    if (hashedPassword) {
      const [result] = await pool.query(
        'UPDATE petugas SET nama = ?, no_hp = ?, password = ? WHERE id = ?',
        [nama, no_hp, hashedPassword, id]
      );
      return result.affectedRows > 0;
    } else {
      const [result] = await pool.query(
        'UPDATE petugas SET nama = ?, no_hp = ? WHERE id = ?',
        [nama, no_hp, id]
      );
      return result.affectedRows > 0;
    }
  },

  /**
   * Update reset token for password recovery
   */
  async updateResetToken(email, token, expires) {
    const [result] = await pool.query(
      'UPDATE petugas SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
      [token, expires, email]
    );
    return result.affectedRows > 0;
  },

  /**
   * Find petugas by reset token (valid, not expired)
   */
  async findByResetToken(token) {
    const [rows] = await pool.query(
      'SELECT * FROM petugas WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    return rows[0] || null;
  },

  /**
   * Reset password and clear reset token
   */
  async resetPassword(userId, hashedPassword) {
    const [result] = await pool.query(
      'UPDATE petugas SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, userId]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Petugas;
