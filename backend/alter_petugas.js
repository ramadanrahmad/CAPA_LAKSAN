const pool = require('./config/db');
pool.query("ALTER TABLE petugas MODIFY COLUMN role enum('sertifikasi','inspeksi','admin','supervisor') NOT NULL DEFAULT 'sertifikasi'")
  .then(() => { console.log("SUCCESS"); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
