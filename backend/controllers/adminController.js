const pool = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * Get all petugas
 * GET /api/admin/petugas
 */
const getAllPetugas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nip, nama, email, no_hp, role, created_at FROM petugas ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get all petugas error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

/**
 * Create new petugas
 * POST /api/admin/petugas
 */
const createPetugas = async (req, res) => {
  try {
    const { nip, nama, email, role } = req.body;
    const no_hp = null; // Removed from frontend

    if (!nip || !nama || !email || !role) {
      return res.status(400).json({ success: false, message: 'Semua field (NIP, Nama, Email, Role) harus diisi.' });
    }

    if (!['sertifikasi', 'inspeksi', 'admin', 'supervisor'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role tidak valid.' });
    }

    // Check if NIP exists
    const [existingNip] = await pool.query('SELECT id FROM petugas WHERE nip = ?', [nip]);
    if (existingNip.length > 0) {
      return res.status(409).json({ success: false, message: 'NIP sudah terdaftar.' });
    }

    // Check if Email exists
    const [existingEmail] = await pool.query('SELECT id FROM petugas WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar sebagai petugas.' });
    }

    // Check if Email exists in users
    const [existingUserEmail] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUserEmail.length > 0) {
      return res.status(409).json({ success: false, message: 'Email sudah digunakan oleh Pelaku Usaha.' });
    }

    // Generate random temporary password. User must use Forgot Password to set their own.
    const tempPassword = require('crypto').randomBytes(8).toString('hex');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    await pool.query(
      'INSERT INTO petugas (nip, password, nama, email, no_hp, role) VALUES (?, ?, ?, ?, ?, ?)',
      [nip, hashedPassword, nama, email, no_hp, role]
    );

    res.status(201).json({ success: true, message: 'Akun petugas berhasil dibuat. Silakan gunakan Lupa Password untuk login pertama kali.' });
  } catch (error) {
    console.error('Create petugas error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

/**
 * Update petugas
 * PUT /api/admin/petugas/:id
 */
const updatePetugas = async (req, res) => {
  try {
    const { id } = req.params;
    const { nip, nama, email, role } = req.body;
    const no_hp = null; // Removed from frontend

    if (!nip || !nama || !email || !role) {
      return res.status(400).json({ success: false, message: 'Semua data harus diisi.' });
    }

    // Check if NIP exists for another user
    const [existingNip] = await pool.query('SELECT id FROM petugas WHERE nip = ? AND id != ?', [nip, id]);
    if (existingNip.length > 0) {
      return res.status(409).json({ success: false, message: 'NIP sudah digunakan oleh akun lain.' });
    }

    // Check if Email exists for another user in petugas
    const [existingEmail] = await pool.query('SELECT id FROM petugas WHERE email = ? AND id != ?', [email, id]);
    if (existingEmail.length > 0) {
      return res.status(409).json({ success: false, message: 'Email sudah digunakan oleh akun petugas lain.' });
    }

    // Check if Email exists in users table (Pelaku Usaha)
    const [existingUserEmail] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUserEmail.length > 0) {
      return res.status(409).json({ success: false, message: 'Email sudah digunakan oleh akun Pelaku Usaha.' });
    }

    await pool.query(
      'UPDATE petugas SET nip = ?, nama = ?, email = ?, no_hp = ?, role = ? WHERE id = ?',
      [nip, nama, email, no_hp, role, id]
    );

    res.json({ success: true, message: 'Akun petugas berhasil diperbarui.' });
  } catch (error) {
    console.error('Update petugas error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

/**
 * Delete petugas
 * DELETE /api/admin/petugas/:id
 */
const deletePetugas = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun sendiri.' });
    }

    await pool.query('DELETE FROM petugas WHERE id = ?', [id]);
    res.json({ success: true, message: 'Akun petugas berhasil dihapus.' });
  } catch (error) {
    console.error('Delete petugas error:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ success: false, message: 'Tidak dapat menghapus petugas karena masih ditugaskan pada formulir permohonan/CAPA. Silakan hapus atau pindahkan tugas terlebih dahulu.' });
    }
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = {
  getAllPetugas,
  createPetugas,
  updatePetugas,
  deletePetugas
};
