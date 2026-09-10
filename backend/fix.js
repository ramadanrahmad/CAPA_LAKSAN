const mysql = require('mysql2/promise');
async function fix() {
  const conn = await mysql.createConnection({host:'localhost', user:'root', database:'auth_app'});
  await conn.query(`UPDATE permohonan_sertifikasi SET status = 'Perlu Revisi' WHERE id = 10`);
  console.log('fixed');
  conn.end();
}
fix();
