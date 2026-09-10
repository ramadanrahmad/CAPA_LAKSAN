const pool = require('./config/db');

async function fixDB() {
  try {
    const [result] = await pool.query(`UPDATE permohonan_inspeksi SET status = 'Perlu Evaluasi' WHERE id = 3`);
    console.log('Update result:', result);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixDB();
