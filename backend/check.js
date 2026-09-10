const mysql = require('mysql2/promise');
async function check() {
  const conn = await mysql.createConnection({host:'localhost', user:'root', database:'auth_app'});
  const [rows] = await conn.query("SHOW COLUMNS FROM capa_sertifikasi LIKE 'bukti'");
  console.log(rows);
  conn.end();
}
check();
