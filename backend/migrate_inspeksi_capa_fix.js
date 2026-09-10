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
    console.log("Dropping capa_inspeksi...");
    await pool.query('DROP TABLE IF EXISTS capa_inspeksi');

    console.log("Recreating table capa_inspeksi...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS capa_inspeksi (
        id INT AUTO_INCREMENT PRIMARY KEY,
        permohonan_id INT NOT NULL,
        temuan TEXT NOT NULL,
        kriteria ENUM('Mayor', 'Minor', 'Serius', 'Kritikal') NOT NULL,
        persyaratan TEXT NOT NULL,
        gap_analysis TEXT,
        dampak TEXT,
        tindakan_perbaikan TEXT,
        tindakan_pencegahan TEXT,
        waktu_penyelesaian DATE,
        pic VARCHAR(100),
        bukti VARCHAR(255),
        hasil_evaluasi ENUM('Memenuhi Syarat', 'Tidak Memenuhi Syarat') DEFAULT NULL,
        status_capa ENUM('Open', 'Closed') DEFAULT 'Open',
        revisi_note TEXT,
        parent_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (permohonan_id) REFERENCES permohonan_inspeksi(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES capa_inspeksi(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    pool.end();
  }
}

migrate();
