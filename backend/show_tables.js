const pool = require('./config/db');
pool.query('SHOW TABLES').then(([rows]) => { console.log(rows); process.exit(0); });
