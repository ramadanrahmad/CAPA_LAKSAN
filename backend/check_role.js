const pool = require('./config/db');
pool.query('DESCRIBE users').then(([rows]) => { console.log(rows); process.exit(0); });
