const mysql = require('mysql2/promise');
async function run() {
  try {
    const pool = mysql.createPool({host: 'localhost', user: 'root', password: '', database: 'auth_app'});
    const [rows1] = await pool.query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'auth_app' AND TABLE_NAME = 'permohonan_sertifikasi' AND COLUMN_NAME = 'penanggung_jawab_id'");
    console.log('sertifikasi FKs:', rows1);
    const [rows2] = await pool.query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'auth_app' AND TABLE_NAME = 'permohonan_inspeksi' AND COLUMN_NAME = 'penanggung_jawab_id'");
    console.log('inspeksi FKs:', rows2);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
