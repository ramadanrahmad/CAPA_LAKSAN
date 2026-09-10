const pool = require('../config/db');

const getAllAntrean = async (req, res) => {
  try {
    // Get all sertifikasi
    const [sertifikasi] = await pool.query(
      `SELECT p.*, GROUP_CONCAT(pt.nama SEPARATOR ', ') as penanggung_jawab_nama 
       FROM permohonan_sertifikasi p
       LEFT JOIN petugas pt ON FIND_IN_SET(pt.id, p.penanggung_jawab_id) > 0
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    );
    
    // Add type to each
    const sertiWithType = sertifikasi.map(item => ({ ...item, type: 'sertifikasi' }));

    // Get all inspeksi
    const [inspeksi] = await pool.query(
      `SELECT p.*, GROUP_CONCAT(pt.nama SEPARATOR ', ') as penanggung_jawab_nama 
       FROM permohonan_inspeksi p
       LEFT JOIN petugas pt ON FIND_IN_SET(pt.id, p.penanggung_jawab_id) > 0
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    );
    
    // Add type to each
    const inspeksiWithType = inspeksi.map(item => ({ ...item, type: 'inspeksi' }));

    // Combine and sort by created_at desc
    const combined = [...sertiWithType, ...inspeksiWithType].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, data: combined });
  } catch (error) {
    console.error('Get all antrean error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data antrean.' });
  }
};

const getSertifikasiSelesai = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, GROUP_CONCAT(pt.nama SEPARATOR ', ') as penanggung_jawab_nama 
       FROM permohonan_sertifikasi p
       LEFT JOIN petugas pt ON FIND_IN_SET(pt.id, p.penanggung_jawab_id) > 0
       WHERE p.status = 'Sertifikasi Selesai'
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    );
    res.json({ success: true, data: rows.map(item => ({ ...item, type: 'sertifikasi' })) });
  } catch (error) {
    console.error('Get sertifikasi selesai error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data sertifikasi selesai.' });
  }
};

const getInspeksiSelesai = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, GROUP_CONCAT(pt.nama SEPARATOR ', ') as penanggung_jawab_nama 
       FROM permohonan_inspeksi p
       LEFT JOIN petugas pt ON FIND_IN_SET(pt.id, p.penanggung_jawab_id) > 0
       WHERE p.status = 'Inspeksi Selesai' OR p.status = 'Pemeriksaan Selesai'
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    );
    res.json({ success: true, data: rows.map(item => ({ ...item, type: 'inspeksi' })) });
  } catch (error) {
    console.error('Get inspeksi selesai error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data inspeksi selesai.' });
  }
};

const getInformasi = async (req, res) => {
  try {
    const [sertifikasi] = await pool.query(`
      SELECT 
        p.id,
        p.created_at, 
        p.nama_sarana, 
        p.alamat_sarana, 
        p.tanggal_pemeriksaan, 
        p.tanggal_capa,
        p.tanggal_terima,
        NULL as tanggal_surat_tl,
        SUM(CASE WHEN c.kriteria = 'Minor' THEN 1 ELSE 0 END) as temuan_minor,
        SUM(CASE WHEN c.kriteria = 'Mayor' THEN 1 ELSE 0 END) as temuan_mayor,
        SUM(CASE WHEN c.kriteria = 'Serius' THEN 1 ELSE 0 END) as temuan_serius,
        SUM(CASE WHEN c.kriteria = 'Kritikal' THEN 1 ELSE 0 END) as temuan_kritikal,
        SUM(CASE WHEN c.kriteria = 'Minor' AND c.status_capa != 'Closed' THEN 1 ELSE 0 END) as evaluasi_minor,
        SUM(CASE WHEN c.kriteria = 'Mayor' AND c.status_capa != 'Closed' THEN 1 ELSE 0 END) as evaluasi_mayor,
        SUM(CASE WHEN c.kriteria = 'Serius' AND c.status_capa != 'Closed' THEN 1 ELSE 0 END) as evaluasi_serius,
        SUM(CASE WHEN c.kriteria = 'Kritikal' AND c.status_capa != 'Closed' THEN 1 ELSE 0 END) as evaluasi_kritikal
       FROM permohonan_sertifikasi p
       LEFT JOIN capa_sertifikasi c ON p.id = c.permohonan_id
       WHERE p.status != 'Menunggu Persetujuan' AND p.status != 'Ditolak'
       GROUP BY p.id
       ORDER BY p.created_at DESC
    `);
    
    const [inspeksi] = await pool.query(`
      SELECT 
        p.id,
        p.created_at, 
        p.nama_sarana, 
        p.alamat_sarana, 
        p.tanggal_pemeriksaan, 
        p.tanggal_capa,
        p.tanggal_terima,
        p.tanggal_evaluasi as tanggal_surat_tl,
        SUM(CASE WHEN c.kriteria = 'Minor' THEN 1 ELSE 0 END) as temuan_minor,
        SUM(CASE WHEN c.kriteria = 'Mayor' THEN 1 ELSE 0 END) as temuan_mayor,
        SUM(CASE WHEN c.kriteria = 'Serius' THEN 1 ELSE 0 END) as temuan_serius,
        SUM(CASE WHEN c.kriteria = 'Kritikal' THEN 1 ELSE 0 END) as temuan_kritikal,
        SUM(CASE WHEN c.kriteria = 'Minor' AND c.status_capa != 'Closed' THEN 1 ELSE 0 END) as evaluasi_minor,
        SUM(CASE WHEN c.kriteria = 'Mayor' AND c.status_capa != 'Closed' THEN 1 ELSE 0 END) as evaluasi_mayor,
        SUM(CASE WHEN c.kriteria = 'Serius' AND c.status_capa != 'Closed' THEN 1 ELSE 0 END) as evaluasi_serius,
        SUM(CASE WHEN c.kriteria = 'Kritikal' AND c.status_capa != 'Closed' THEN 1 ELSE 0 END) as evaluasi_kritikal
       FROM permohonan_inspeksi p
       LEFT JOIN capa_inspeksi c ON p.id = c.permohonan_id
       WHERE p.status != 'Menunggu Persetujuan' AND p.status != 'Ditolak'
       GROUP BY p.id
       ORDER BY p.created_at DESC
    `);

    const combined = [
      ...sertifikasi.map(s => ({...s, type: 'sertifikasi'})), 
      ...inspeksi.map(i => ({...i, type: 'inspeksi'}))
    ];
    
    res.json({ success: true, data: combined });
  } catch (error) {
    console.error('Get informasi error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data informasi.' });
  }
};

module.exports = {
  getAllAntrean,
  getSertifikasiSelesai,
  getInspeksiSelesai,
  getInformasi
};
