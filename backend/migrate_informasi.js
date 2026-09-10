const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'auth_app',
  });

  try {
    console.log("Adding tanggal_capa to permohonan_sertifikasi...");
    await pool.query(`ALTER TABLE permohonan_sertifikasi ADD COLUMN tanggal_capa DATE NULL`);
    
    console.log("Migration successful!");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Column tanggal_capa already exists.");
    } else {
      console.error("Migration failed:", err);
    }
  } finally {
    pool.end();
  }
}

migrate();
