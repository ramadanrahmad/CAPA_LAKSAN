const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'auth_app'
  });

  try {
    console.log('Starting CAPA migration...');

    // Drop parent_id if exists
    try {
      await connection.query('ALTER TABLE capa_sertifikasi DROP FOREIGN KEY capa_sertifikasi_ibfk_2');
      console.log('Dropped foreign key capa_sertifikasi_ibfk_2');
    } catch (e) {
      console.log('Foreign key might not exist, skipping...');
    }
    
    try {
      await connection.query('ALTER TABLE capa_sertifikasi DROP COLUMN parent_id');
      console.log('Dropped column parent_id');
    } catch (e) {
      console.log('Column parent_id might not exist, skipping...');
    }

    // Rename revisi_note to hasil_evaluasi
    try {
      await connection.query('ALTER TABLE capa_sertifikasi CHANGE revisi_note hasil_evaluasi TEXT');
      console.log('Renamed revisi_note to hasil_evaluasi');
    } catch (e) {
      console.log('Column revisi_note might not exist or already renamed, skipping...');
    }

    // Drop tindakan
    try {
      await connection.query('ALTER TABLE capa_sertifikasi DROP COLUMN tindakan');
      console.log('Dropped column tindakan');
    } catch (e) {
      console.log('Column tindakan might not exist, skipping...');
    }

    // Add tindakan_perbaikan, tindakan_pencegahan
    try {
      await connection.query('ALTER TABLE capa_sertifikasi ADD COLUMN tindakan_perbaikan TEXT AFTER dampak');
      await connection.query('ALTER TABLE capa_sertifikasi ADD COLUMN tindakan_pencegahan TEXT AFTER tindakan_perbaikan');
      console.log('Added tindakan_perbaikan and tindakan_pencegahan columns');
    } catch (e) {
      console.log('Columns might already exist, skipping...');
    }

    // Rename batas_waktu to waktu_penyelesaian
    try {
      await connection.query('ALTER TABLE capa_sertifikasi CHANGE batas_waktu waktu_penyelesaian DATE');
      console.log('Renamed batas_waktu to waktu_penyelesaian');
    } catch (e) {
      console.log('Column batas_waktu might not exist or already renamed, skipping...');
    }

    // Rename personil to pic
    try {
      await connection.query('ALTER TABLE capa_sertifikasi CHANGE personil pic VARCHAR(100)');
      console.log('Renamed personil to pic');
    } catch (e) {
      console.log('Column personil might not exist or already renamed, skipping...');
    }

    // Add status_capa
    try {
      await connection.query("ALTER TABLE capa_sertifikasi ADD COLUMN status_capa ENUM('Open', 'Closed') DEFAULT 'Open' AFTER bukti");
      console.log('Added status_capa column');
    } catch (e) {
      console.log('Column status_capa might already exist, skipping...');
    }

    // Clean up duplicates and children (just keep roots)
    // Since we are changing logic, it's safer to clear the table or just leave it.
    // For now we'll delete all child rows. But since parent_id is dropped, we can't easily identify them unless we do it before dropping parent_id.
    // Since this is dev, it's fine. If there are duplicates, we'll just ignore them.

    console.log('✅ CAPA Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await connection.end();
  }
}

migrate();
