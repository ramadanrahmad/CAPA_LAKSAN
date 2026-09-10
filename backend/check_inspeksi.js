const pool = require('./config/db');
pool.query('DESCRIBE permohonan_inspeksi').then(([rows]) => { console.log(rows); process.exit(0); });
