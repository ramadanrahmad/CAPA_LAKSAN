require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'auth_app'
    });

    console.log('Menghubungkan ke database...');

    // 1. Drop Foreign Key for Sertifikasi
    try {
      await connection.query(`ALTER TABLE permohonan_sertifikasi DROP FOREIGN KEY permohonan_sertifikasi_ibfk_2`);
      console.log('✅ FK permohonan_sertifikasi_ibfk_2 berhasil dihapus');
    } catch (e) {
      console.log('⚠️ FK permohonan_sertifikasi_ibfk_2 mungkin sudah terhapus:', e.message);
    }

    // 2. Modify Column Type for Sertifikasi
    try {
      await connection.query(`ALTER TABLE permohonan_sertifikasi MODIFY penanggung_jawab_id VARCHAR(100) NOT NULL`);
      console.log('✅ Kolom penanggung_jawab_id pada sertifikasi berhasil diubah menjadi VARCHAR(100)');
    } catch (e) {
      console.error('❌ Gagal mengubah kolom pada sertifikasi:', e.message);
    }

    // 3. Drop Foreign Key for Inspeksi
    try {
      await connection.query(`ALTER TABLE permohonan_inspeksi DROP FOREIGN KEY permohonan_inspeksi_ibfk_2`);
      console.log('✅ FK permohonan_inspeksi_ibfk_2 berhasil dihapus');
    } catch (e) {
      console.log('⚠️ FK permohonan_inspeksi_ibfk_2 mungkin sudah terhapus:', e.message);
    }

    // 4. Modify Column Type for Inspeksi
    try {
      await connection.query(`ALTER TABLE permohonan_inspeksi MODIFY penanggung_jawab_id VARCHAR(100) NOT NULL`);
      console.log('✅ Kolom penanggung_jawab_id pada inspeksi berhasil diubah menjadi VARCHAR(100)');
    } catch (e) {
      console.error('❌ Gagal mengubah kolom pada inspeksi:', e.message);
    }

    console.log('🎉 Migrasi database selesai!');
    process.exit(0);

  } catch (err) {
    console.error('Koneksi Database Gagal:', err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
