const mysql = require('mysql2/promise');
require('dotenv').config();

async function runTest() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'auth_app',
  });

  const [users] = await conn.query('SELECT * FROM users ORDER BY id DESC LIMIT 1');
  console.log('Latest User:', users[0]);
  
  await conn.end();
}

runTest();
