const pool = require('./config/db');
pool.query("UPDATE permohonan_inspeksi SET status = 'Inspeksi Selesai' WHERE id = 3")
  .then(() => { console.log('SUCCESS'); process.exit(0); });
