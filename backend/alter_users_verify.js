const mysql = require('mysql2/promise');
require('dotenv').config();

async function addVerificationColumns() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'auth_app',
    });

    console.log('Adding verification columns...');
    await conn.query(`
      ALTER TABLE users 
      ADD COLUMN verification_token VARCHAR(255) NULL AFTER email_verified,
      ADD COLUMN verification_token_expires DATETIME NULL AFTER verification_token
    `);
    console.log('Columns added successfully.');

  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist.');
    } else {
      console.error('Error:', error);
    }
  } finally {
    if (conn) {
      await conn.end();
    }
    process.exit();
  }
}

addVerificationColumns();
