const pool = require('./config/db');

async function alterDB() {
  try {
    await pool.query("ALTER TABLE permohonan_inspeksi MODIFY COLUMN status ENUM('Menunggu Penjadwalan','Menunggu Persetujuan','Persetujuan Diterima','Menunggu Evaluasi','Perlu Evaluasi','Upload File','Inspeksi Selesai','Ditolak') DEFAULT 'Menunggu Penjadwalan'");
    console.log('ALTER ENUM SUCCESS');

    // Check if column exists first
    const [cols] = await pool.query("SHOW COLUMNS FROM permohonan_inspeksi LIKE 'file_capa_ttd'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE permohonan_inspeksi ADD COLUMN file_capa_ttd TEXT DEFAULT NULL");
      console.log('ADD COLUMN SUCCESS');
    } else {
      console.log('COLUMN ALREADY EXISTS');
    }

    process.exit(0);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

alterDB();
