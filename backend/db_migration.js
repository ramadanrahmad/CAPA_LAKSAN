const mysql = require('mysql2/promise');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'auth_app',
  });

  try {
    console.log('Adding tahap column to permohonan_sertifikasi...');
    await connection.query(`ALTER TABLE permohonan_sertifikasi ADD COLUMN tahap INT DEFAULT 1;`);
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('Column tahap already exists in permohonan_sertifikasi');
    else throw e;
  }

  try {
    console.log('Adding tahap column to permohonan_inspeksi...');
    await connection.query(`ALTER TABLE permohonan_inspeksi ADD COLUMN tahap INT DEFAULT 1;`);
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('Column tahap already exists in permohonan_inspeksi');
    else throw e;
  }

  console.log('Creating capa_sertifikasi_history table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS capa_sertifikasi_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      capa_id INT NOT NULL,
      permohonan_id INT NOT NULL,
      tahap INT NOT NULL,
      temuan TEXT NOT NULL,
      kriteria VARCHAR(50) NOT NULL,
      persyaratan TEXT NOT NULL,
      gap_analysis TEXT,
      dampak TEXT,
      tindakan_perbaikan TEXT,
      tindakan_pencegahan TEXT,
      waktu_penyelesaian VARCHAR(255),
      pic VARCHAR(255),
      bukti TEXT,
      hasil_evaluasi TEXT,
      status_capa ENUM('Open', 'Closed') DEFAULT 'Open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (permohonan_id) REFERENCES permohonan_sertifikasi(id) ON DELETE CASCADE,
      FOREIGN KEY (capa_id) REFERENCES capa_sertifikasi(id) ON DELETE CASCADE
    );
  `);

  console.log('Creating capa_inspeksi_history table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS capa_inspeksi_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      capa_id INT NOT NULL,
      permohonan_id INT NOT NULL,
      tahap INT NOT NULL,
      temuan TEXT NOT NULL,
      kriteria VARCHAR(50) NOT NULL,
      persyaratan TEXT NOT NULL,
      gap_analysis TEXT,
      dampak TEXT,
      tindakan_perbaikan TEXT,
      tindakan_pencegahan TEXT,
      waktu_penyelesaian VARCHAR(255),
      pic VARCHAR(255),
      bukti TEXT,
      file_surat TEXT,
      hasil_evaluasi TEXT,
      status_capa ENUM('Open', 'Closed', 'Menunggu Evaluasi') DEFAULT 'Open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (permohonan_id) REFERENCES permohonan_inspeksi(id) ON DELETE CASCADE,
      FOREIGN KEY (capa_id) REFERENCES capa_inspeksi(id) ON DELETE CASCADE
    );
  `);

  console.log('Migration completed successfully.');
  await connection.end();
}

runMigration().catch(err => {
  console.error(err);
  process.exit(1);
});
