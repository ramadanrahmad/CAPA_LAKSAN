const pool = require('../config/db');

const CapaSertifikasi = {
  /**
   * Create multiple CAPA rows
   * @param {Array} rows - Array of objects { permohonan_id, temuan, kriteria, persyaratan }
   */
  async createBulk(rows) {
    if (!rows || rows.length === 0) return 0;
    
    const promises = rows.map(row => {
      return pool.query(
        `INSERT INTO capa_sertifikasi (permohonan_id, temuan, kriteria, persyaratan) 
         VALUES (?, ?, ?, ?)`,
        [
          row.permohonan_id,
          row.temuan,
          row.kriteria,
          row.persyaratan
        ]
      );
    });

    const results = await Promise.all(promises);
    return results.length;
  },

  /**
   * Get CAPA by Permohonan ID
   */
  async findByPermohonanId(permohonan_id) {
    const [rows] = await pool.query(
      `SELECT * FROM capa_sertifikasi WHERE permohonan_id = ? ORDER BY id ASC`,
      [permohonan_id]
    );
    return rows;
  },

  /**
   * Update multiple CAPA rows (Pelaku Usaha or Petugas Edit)
   */
  async updateBulk(rows) {
    if (!rows || rows.length === 0) return 0;
    
    // We update row by row using Promise.all
    const promises = rows.map(row => {
      // Allow Petugas or Pelaku Usaha to update their respective columns
      return pool.query(
        `UPDATE capa_sertifikasi 
         SET temuan = ?, kriteria = ?, persyaratan = ?, 
             gap_analysis = ?, dampak = ?, tindakan_perbaikan = ?, tindakan_pencegahan = ?, 
             waktu_penyelesaian = ?, pic = ?, bukti = ?, hasil_evaluasi = ?, status_capa = ?
         WHERE id = ?`,
        [
          row.temuan, row.kriteria, row.persyaratan,
          row.gap_analysis, row.dampak, row.tindakan_perbaikan, row.tindakan_pencegahan, 
          row.waktu_penyelesaian || null, row.pic, row.bukti, row.hasil_evaluasi || null, row.status_capa || 'Open',
          row.id
        ]
      );
    });

    const results = await Promise.all(promises);
    return results.length;
  },

  /**
   * Snapshot current CAPA rows to history table
   */
  async snapshotHistory(permohonan_id, tahap) {
    const [result] = await pool.query(
      `INSERT INTO capa_sertifikasi_history 
        (capa_id, permohonan_id, tahap, temuan, kriteria, persyaratan, gap_analysis, dampak, 
         tindakan_perbaikan, tindakan_pencegahan, waktu_penyelesaian, pic, bukti, hasil_evaluasi, status_capa)
       SELECT id, permohonan_id, ?, temuan, kriteria, persyaratan, gap_analysis, dampak, 
              tindakan_perbaikan, tindakan_pencegahan, waktu_penyelesaian, pic, bukti, hasil_evaluasi, status_capa
       FROM capa_sertifikasi 
       WHERE permohonan_id = ?`,
      [tahap, permohonan_id]
    );
    return result.affectedRows;
  },

  /**
   * Fetch all history for a permohonan, ordered by tahap and id
   */
  async findHistoryByPermohonanId(permohonan_id) {
    const [rows] = await pool.query(
      `SELECT * FROM capa_sertifikasi_history WHERE permohonan_id = ? ORDER BY tahap ASC, capa_id ASC`,
      [permohonan_id]
    );
    return rows;
  }
};

module.exports = CapaSertifikasi;
