const pool = require('./config/db');

async function alterTable() {
  try {
    console.log('Menambahkan kolom tanggal_evaluasi dan file_evaluasi ke permohonan_inspeksi...');
    await pool.query('ALTER TABLE permohonan_inspeksi ADD COLUMN tanggal_evaluasi DATE DEFAULT NULL');
    console.log('✅ Kolom tanggal_evaluasi berhasil ditambahkan.');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️ Kolom tanggal_evaluasi sudah ada.');
    } else {
      console.error('❌ Gagal menambahkan tanggal_evaluasi:', error.message);
    }
  }

  try {
    await pool.query('ALTER TABLE permohonan_inspeksi ADD COLUMN file_evaluasi TEXT DEFAULT NULL');
    console.log('✅ Kolom file_evaluasi berhasil ditambahkan.');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️ Kolom file_evaluasi sudah ada.');
    } else {
      console.error('❌ Gagal menambahkan file_evaluasi:', error.message);
    }
  }

  process.exit();
}

alterTable();
