const mysql = require('mysql2/promise');
require('dotenv').config();

async function runTest() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'auth_app',
  });

  try {
    const [rows1] = await conn.query("SHOW CREATE TABLE petugas");
    console.log(rows1[0]['Create Table']);
  } catch (err) {
    console.error(err.message);
  }
  
  await conn.end();
}

runTest();
