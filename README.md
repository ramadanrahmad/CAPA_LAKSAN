# LAKSAN (Layanan Akses Sertifikasi dan Inspeksi) 🏥

![LAKSAN Banner](https://img.shields.io/badge/BBPOM-Palembang-blue)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql)

**LAKSAN** adalah Sistem Informasi Layanan Akses Sertifikasi dan Inspeksi yang dikembangkan khusus untuk **Balai Besar Pengawas Obat dan Makanan (BBPOM) di Palembang**. 

Sistem berbasis *web* ini bertujuan untuk mendigitalisasi proses birokrasi permohonan sertifikasi/inspeksi sarana dan mempermudah pelaporan Tindakan Perbaikan dan Pencegahan (CAPA / *GAP Analysis*) oleh Pelaku Usaha secara interaktif dan *paperless*.

## 🌟 Fitur Utama

Aplikasi LAKSAN mengadopsi arsitektur keamanan **Role-Based Access Control (RBAC)** yang membagi wewenang ke dalam 4 entitas pengguna:

1. **Pelaku Usaha (Eksternal):**
   - Registrasi akun mandiri.
   - Pengajuan permohonan Sertifikasi dan Inspeksi Sarana.
   - Pemantauan status permohonan secara *real-time*.
   - Pengisian formulir evaluasi CAPA secara interaktif beserta fitur *upload* bukti perbaikan (gambar/PDF).
   - Pengunduhan Sertifikat elektronik.
2. **Petugas (Internal):**
   - Peninjauan dokumen permohonan masuk.
   - Pemberian evaluasi dan *GAP Analysis* kepada Pelaku Usaha.
3. **Supervisor (Internal):**
   - Peninjauan hasil evaluasi petugas lapangan.
   - Pemberian persetujuan akhir dan penerbitan sertifikat.
4. **Administrator (Internal):**
   - Pusat kendali (*Back-Office*) manajemen akun pegawai.
   - Pengaturan *Role* dan Hak Akses sistem.

## 🛠️ Teknologi yang Digunakan (Tech Stack)

Proyek ini dibangun menggunakan pendekatan *Full-Stack JavaScript*:

* **Frontend:** React.js (Vite), HTML5, CSS3.
* **Backend:** Node.js, Express.js (RESTful API).
* **Database:** MySQL (Relational Database).
* **Security:** JSON Web Tokens (JWT) untuk autentikasi sesi, Bcrypt untuk enkripsi kata sandi.

## 🚀 Panduan Instalasi (Menjalankan secara Lokal)

Ikuti langkah-langkah berikut untuk menjalankan sistem LAKSAN di komputer lokal Anda:

### 1. Persiapan Database
1. Pastikan Anda telah menginstal **XAMPP** (atau server MySQL lainnya).
2. Jalankan modul **Apache** dan **MySQL** di XAMPP Control Panel.
3. Buat database baru di phpMyAdmin (misal: `laksan_db`).
4. *Import* file skema database yang ada di folder `database/schema.sql` ke dalam database tersebut.

### 2. Konfigurasi Backend
1. Buka terminal/CMD dan arahkan ke folder `backend`.
   ```bash
   cd backend
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Ubah nama file `.env.example` menjadi `.env`, lalu sesuaikan kredensial database Anda (seperti nama database dan password).
4. Jalankan server backend:
   ```bash
   npm run dev
   ```

### 3. Konfigurasi Frontend
1. Buka terminal baru (biarkan terminal backend tetap berjalan) dan arahkan ke folder `frontend`.
   ```bash
   cd frontend
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Jalankan aplikasi web:
   ```bash
   npm run dev
   ```
4. Buka *browser* Anda dan akses URL yang diberikan (biasanya `http://localhost:5173`).

## 👨‍💻 Pengembang
Dikembangkan oleh **Rahmad Ramadan** sebagai bagian dari pelaksanaan Kerja Praktik di Balai Besar Pengawas Obat dan Makanan (BBPOM) di Palembang (Tahun 2026).

---
*© 2026 LAKSAN BBPOM Palembang. All rights reserved.*
