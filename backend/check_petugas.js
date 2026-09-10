const pool = require('./config/db');

async function check() {
  try {
    const [rows] = await pool.query('SELECT * FROM petugas WHERE email = ?', ['salsabilaswot@gmail.com']);
    console.log(rows);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

check();
