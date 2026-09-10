const mysql = require('mysql2/promise');
async function alter() {
  const conn = await mysql.createConnection({host:'localhost', user:'root', database:'auth_app'});
  await conn.query("ALTER TABLE capa_sertifikasi MODIFY COLUMN bukti TEXT");
  console.log("Column altered to TEXT");
  conn.end();
}
alter();
