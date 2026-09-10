const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const createPetugas = async () => {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.log('❌ Penggunaan salah!');
    console.log('Cara pakai: node create_petugas.js <NIP> <PASSWORD> <NAMA_LENGKAP> <ROLE>');
    console.log('Role yang tersedia: sertifikasi | inspeksi | admin');
    console.log('Contoh: node create_petugas.js "123456" "sandi123" "Budi Santoso" "sertifikasi"');
    process.exit(1);
  }

  const [nip, password, nama, role] = args;
  
  if (!['sertifikasi', 'inspeksi', 'admin'].includes(role)) {
    console.log('❌ Role tidak valid! Gunakan: sertifikasi, inspeksi, atau admin.');
    process.exit(1);
  }

  try {
    console.log(`⏳ Membuat akun petugas: ${nama} (NIP: ${nip}, Role: ${role})...`);

    const pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'auth_app',
    });

    // Cek apakah NIP sudah ada
    const [existing] = await pool.query('SELECT id FROM petugas WHERE nip = ?', [nip]);
    if (existing.length > 0) {
      console.log('❌ NIP sudah terdaftar di database!');
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert ke database
    await pool.query(
      'INSERT INTO petugas (nip, password, nama, role) VALUES (?, ?, ?, ?)',
      [nip, hashedPassword, nama, role]
    );

    console.log('✅ Berhasil! Akun petugas telah ditambahkan ke database.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Terjadi kesalahan:', error.message);
    process.exit(1);
  }
};

createPetugas();
