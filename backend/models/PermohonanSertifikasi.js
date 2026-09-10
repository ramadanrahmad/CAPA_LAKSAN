const pool = require('../config/db');

const PermohonanSertifikasi = {
  /**
   * Create new Permohonan Sertifikasi
   */
  async create(data) {
    const {
      user_id,
      nama_sarana,
      alamat_sarana,
      no_hp,
      email_sarana,
      penanggung_jawab_id,
      tanggal_pemeriksaan,
      tanggal_terima,
      kabupaten_kota,
      jenis_komoditi,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO permohonan_sertifikasi (
        user_id, nama_sarana, alamat_sarana, no_hp, email_sarana, 
        penanggung_jawab_id, tanggal_pemeriksaan, tanggal_terima, 
        kabupaten_kota, jenis_komoditi
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        nama_sarana,
        alamat_sarana,
        no_hp,
        email_sarana,
        penanggung_jawab_id,
        tanggal_pemeriksaan || null,
        tanggal_terima || null,
        kabupaten_kota,
        jenis_komoditi,
      ]
    );

    return result.insertId;
  },

  /**
   * Find by User ID
   */
  async findByUserId(user_id) {
    const [rows] = await pool.query(
      `SELECT p.*, GROUP_CONCAT(pt.nama SEPARATOR ', ') as penanggung_jawab_nama 
       FROM permohonan_sertifikasi p
       LEFT JOIN petugas pt ON FIND_IN_SET(pt.id, p.penanggung_jawab_id) > 0
       WHERE p.user_id = ? 
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [user_id]
    );
    return rows;
  },

  /**
   * Find by Penanggung Jawab ID (Petugas)
   */
  async findByPenanggungJawab(petugas_id) {
    const [rows] = await pool.query(
      `SELECT p.*, GROUP_CONCAT(pt.nama SEPARATOR ', ') as penanggung_jawab_nama 
       FROM permohonan_sertifikasi p
       LEFT JOIN petugas pt ON FIND_IN_SET(pt.id, p.penanggung_jawab_id) > 0
       WHERE FIND_IN_SET(?, p.penanggung_jawab_id) > 0
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [petugas_id]
    );
    return rows;
  },

  /**
   * Get Informasi for Petugas (Aggregation with CAPA)
   */
  async getInformasiByPetugas(petugas_id) {
    const [rows] = await pool.query(
      `SELECT 
        p.id, 
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
       WHERE FIND_IN_SET(?, p.penanggung_jawab_id) > 0 
         AND p.status != 'Menunggu Persetujuan' AND p.status != 'Ditolak'
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [petugas_id]
    );
    return rows;
  },

  /**
   * Update Status
   */
  async updateStatus(id, status) {
    const [result] = await pool.query(
      `UPDATE permohonan_sertifikasi SET status = ? WHERE id = ?`,
      [status, id]
    );
    return result.affectedRows;
  },

  /**
   * Update Tanggal CAPA (only if null)
   */
  async updateTanggalCapa(id) {
    const [result] = await pool.query(
      `UPDATE permohonan_sertifikasi SET tanggal_capa = CURRENT_DATE WHERE id = ? AND tanggal_capa IS NULL`,
      [id]
    );
    return result.affectedRows;
  },

  /**
   * Find by ID
   */
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT * FROM permohonan_sertifikasi WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  /**
   * Increment Tahap
   */
  async incrementTahap(id) {
    const [result] = await pool.query(
      `UPDATE permohonan_sertifikasi SET tahap = tahap + 1 WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  }
};

module.exports = PermohonanSertifikasi;
