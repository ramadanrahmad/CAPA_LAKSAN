const pool = require('./config/db');

async function test() {
  try {
    const [sertifikasi] = await pool.query(
      `SELECT p.*, u.nama as penanggung_jawab_nama 
       FROM permohonan_sertifikasi p
       LEFT JOIN users u ON p.penanggung_jawab_id = u.id
       ORDER BY p.created_at DESC`
    );
    console.log("Serti count:", sertifikasi.length);
    
    const [inspeksi] = await pool.query(
      `SELECT p.*, u.nama as penanggung_jawab_nama 
       FROM permohonan_inspeksi p
       LEFT JOIN users u ON p.penanggung_jawab_id = u.id
       ORDER BY p.created_at DESC`
    );
    console.log("Inspeksi count:", inspeksi.length);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();
