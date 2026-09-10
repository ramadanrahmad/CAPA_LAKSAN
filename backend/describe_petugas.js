const pool = require('./config/db');
pool.query('DESCRIBE petugas').then(([rows]) => { console.log(rows); process.exit(0); });
