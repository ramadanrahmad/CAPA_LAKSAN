const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTable() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'auth_app',
    });
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS petugas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nip VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        nama VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_nip (nip)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Table petugas created');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS permohonan_sertifikasi (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        nama_sarana VARCHAR(255) NOT NULL,
        alamat_sarana TEXT NOT NULL,
        no_hp VARCHAR(20) NOT NULL,
        email_sarana VARCHAR(255) NOT NULL,
        penanggung_jawab_id INT NOT NULL,
        tanggal_pemeriksaan DATE,
        tanggal_terima DATE,
        kabupaten_kota VARCHAR(150) NOT NULL,
        jenis_komoditi ENUM('Pangan', 'Kosmetik', 'Obat', 'Obat Bahan Alam') NOT NULL,
        status ENUM('Menunggu Persetujuan', 'Persetujuan Diterima', 'Menunggu Evaluasi', 'Perlu Evaluasi', 'Sertifikasi Selesai', 'Ditolak') DEFAULT 'Menunggu Persetujuan',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (penanggung_jawab_id) REFERENCES petugas(id) ON DELETE RESTRICT,
        INDEX idx_user_id (user_id),
        INDEX idx_penanggung_jawab_id (penanggung_jawab_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Table permohonan_sertifikasi created');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS permohonan_inspeksi (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        nama_sarana VARCHAR(255) NOT NULL,
        alamat_sarana TEXT NOT NULL,
        no_hp VARCHAR(20) NOT NULL,
        email_sarana VARCHAR(255) NOT NULL,
        penanggung_jawab_id INT NOT NULL,
        tanggal_pemeriksaan DATE,
        tanggal_terima DATE,
        kabupaten_kota VARCHAR(150) NOT NULL,
        jenis_sarana VARCHAR(150) NOT NULL,
        status ENUM('Menunggu Persetujuan', 'Persetujuan Diterima', 'Menunggu Evaluasi', 'Perlu Evaluasi') DEFAULT 'Menunggu Persetujuan',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (penanggung_jawab_id) REFERENCES petugas(id) ON DELETE RESTRICT,
        INDEX idx_user_id (user_id),
        INDEX idx_penanggung_jawab_id (penanggung_jawab_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Table permohonan_inspeksi created');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS capa_sertifikasi (
        id INT AUTO_INCREMENT PRIMARY KEY,
        permohonan_id INT NOT NULL,
        temuan TEXT NOT NULL,
        kriteria ENUM('Mayor', 'Minor', 'Serius', 'Kritikal') NOT NULL,
        persyaratan TEXT NOT NULL,
        gap_analysis TEXT,
        dampak TEXT,
        tindakan TEXT,
        batas_waktu DATE,
        personil VARCHAR(100),
        bukti VARCHAR(255),
        revisi_note TEXT,
        parent_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (permohonan_id) REFERENCES permohonan_sertifikasi(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES capa_sertifikasi(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Table capa_sertifikasi created');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createTable();
