const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'auth_app',
  });

  try {
    console.log("Adding new ENUM values to permohonan_sertifikasi...");
    await pool.query(`ALTER TABLE permohonan_sertifikasi MODIFY COLUMN status ENUM('Menunggu Persetujuan', 'Persetujuan Diterima', 'Menunggu Revisi', 'Perlu Revisi', 'Menunggu Evaluasi', 'Perlu Evaluasi', 'Sertifikasi Selesai', 'Ditolak') DEFAULT 'Menunggu Persetujuan'`);
    
    console.log("Updating rows in permohonan_sertifikasi...");
    await pool.query(`UPDATE permohonan_sertifikasi SET status = 'Menunggu Evaluasi' WHERE status = 'Menunggu Revisi'`);
    await pool.query(`UPDATE permohonan_sertifikasi SET status = 'Perlu Evaluasi' WHERE status = 'Perlu Revisi'`);
    
    console.log("Removing old ENUM values from permohonan_sertifikasi...");
    await pool.query(`ALTER TABLE permohonan_sertifikasi MODIFY COLUMN status ENUM('Menunggu Persetujuan', 'Persetujuan Diterima', 'Menunggu Evaluasi', 'Perlu Evaluasi', 'Sertifikasi Selesai', 'Ditolak') DEFAULT 'Menunggu Persetujuan'`);

    console.log("Adding new ENUM values to permohonan_inspeksi...");
    await pool.query(`ALTER TABLE permohonan_inspeksi MODIFY COLUMN status ENUM('Menunggu Penjadwalan', 'Menunggu Persetujuan', 'Persetujuan Diterima', 'Menunggu Revisi', 'Perlu Revisi', 'Menunggu Evaluasi', 'Perlu Evaluasi', 'Inspeksi Selesai', 'Ditolak') DEFAULT 'Menunggu Penjadwalan'`);
    
    console.log("Updating rows in permohonan_inspeksi...");
    await pool.query(`UPDATE permohonan_inspeksi SET status = 'Menunggu Evaluasi' WHERE status = 'Menunggu Revisi'`);
    await pool.query(`UPDATE permohonan_inspeksi SET status = 'Perlu Evaluasi' WHERE status = 'Perlu Revisi'`);
    
    console.log("Removing old ENUM values from permohonan_inspeksi...");
    await pool.query(`ALTER TABLE permohonan_inspeksi MODIFY COLUMN status ENUM('Menunggu Penjadwalan', 'Menunggu Persetujuan', 'Persetujuan Diterima', 'Menunggu Evaluasi', 'Perlu Evaluasi', 'Inspeksi Selesai', 'Ditolak') DEFAULT 'Menunggu Penjadwalan'`);

    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    pool.end();
  }
}

migrate();
