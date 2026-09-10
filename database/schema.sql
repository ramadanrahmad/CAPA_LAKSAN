-- ============================================
-- Database Schema for Auth Application
-- ============================================

CREATE DATABASE IF NOT EXISTS auth_app;
USE auth_app;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    no_hp VARCHAR(20) DEFAULT NULL,
    password VARCHAR(255) DEFAULT NULL,
    avatar VARCHAR(500) DEFAULT NULL,
    provider ENUM('local', 'google') DEFAULT 'local',
    provider_id VARCHAR(255) DEFAULT NULL,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expires DATETIME DEFAULT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_provider (provider, provider_id),
    INDEX idx_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Petugas table
CREATE TABLE IF NOT EXISTS petugas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nip VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(255) DEFAULT NULL UNIQUE,
    no_hp VARCHAR(20) DEFAULT NULL,
    role ENUM('sertifikasi', 'inspeksi', 'admin') NOT NULL DEFAULT 'sertifikasi',
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expires DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nip (nip),
    INDEX idx_email (email),
    INDEX idx_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permohonan Sertifikasi table
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
    status ENUM('Menunggu Persetujuan', 'Persetujuan Diterima', 'Menunggu Revisi', 'Perlu Revisi') DEFAULT 'Menunggu Persetujuan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (penanggung_jawab_id) REFERENCES petugas(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_penanggung_jawab_id (penanggung_jawab_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permohonan Inspeksi table
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
    status ENUM('Menunggu Persetujuan', 'Persetujuan Diterima', 'Menunggu Revisi', 'Perlu Revisi') DEFAULT 'Menunggu Persetujuan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (penanggung_jawab_id) REFERENCES petugas(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_penanggung_jawab_id (penanggung_jawab_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

