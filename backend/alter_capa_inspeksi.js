const pool = require('./config/db');

async function alterTable() {
  try {
    const [result] = await pool.query(`ALTER TABLE capa_inspeksi ADD COLUMN file_surat TEXT DEFAULT NULL`);
    console.log('Column file_surat added successfully.', result);
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column file_surat already exists.');
      process.exit(0);
    } else {
      console.error(err);
      process.exit(1);
    }
  }
}

alterTable();
