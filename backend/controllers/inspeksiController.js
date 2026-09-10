const PermohonanInspeksi = require('../models/PermohonanInspeksi');

/**
 * Create new Permohonan Inspeksi
 * POST /api/inspeksi/permohonan
 */
const createPermohonan = async (req, res) => {
  try {
    const user_id = req.user.id; // From auth middleware
    const {
      nama_sarana,
      alamat_sarana,
      no_hp,
      email, // using email from frontend form, mapped to email_sarana
      penanggung_jawab_id,
      tanggal_pemeriksaan,
      tanggal_terima,
      kabupaten_kota,
      jenis_sarana,
    } = req.body;

    // Validate required fields
    if (!nama_sarana || !alamat_sarana || !no_hp || !email || !penanggung_jawab_id || !kabupaten_kota || !jenis_sarana) {
      return res.status(400).json({
        success: false,
        message: 'Mohon lengkapi semua field yang wajib diisi.',
      });
    }

    const insertId = await PermohonanInspeksi.create({
      user_id,
      nama_sarana,
      alamat_sarana,
      no_hp,
      email_sarana: email,
      penanggung_jawab_id,
      tanggal_pemeriksaan,
      tanggal_terima,
      kabupaten_kota,
      jenis_sarana,
    });

    res.status(201).json({
      success: true,
      message: 'Permohonan Inspeksi berhasil dikirim!',
      data: { id: insertId }
    });

  } catch (error) {
    console.error('Create permohonan inspeksi error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menyimpan permohonan inspeksi.',
    });
  }
};

/**
 * Get Permohonan by User ID
 * GET /api/inspeksi/permohonan/me
 */
const getMyPermohonan = async (req, res) => {
  try {
    const user_id = req.user.id;
    const data = await PermohonanInspeksi.findByUserId(user_id);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get my permohonan inspeksi error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data permohonan inspeksi.',
    });
  }
};

const getPermohonanByPetugas = async (req, res) => {
  try {
    const petugas_id = req.user.id;
    const data = await PermohonanInspeksi.findByPenanggungJawab(petugas_id);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get permohonan petugas error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data permohonan.' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const permohonan = await PermohonanInspeksi.findById(id);
    
    // If transitioning from Petugas evaluation to Pelaku Usaha or Upload File, save history
    if ((status === 'Menunggu Evaluasi' || status === 'Upload File') && permohonan && permohonan.status === 'Perlu Evaluasi') {
      const CapaInspeksi = require('../models/CapaInspeksi');
      await CapaInspeksi.snapshotHistory(id, permohonan.tahap);
      await PermohonanInspeksi.incrementTahap(id);
    }
    
    await PermohonanInspeksi.updateStatus(id, status);
    
    // Automatically update tanggal capa if moving to Menunggu Evaluasi
    if (status === 'Menunggu Evaluasi') {
      await PermohonanInspeksi.updateTanggalCapa(id);
    }
    
    res.json({ success: true, message: 'Status berhasil diperbarui.' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui status.' });
  }
};

const getInformasiPetugas = async (req, res) => {
  try {
    const petugas_id = req.user.id;
    const data = await PermohonanInspeksi.getInformasiByPetugas(petugas_id);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get informasi petugas error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data informasi.' });
  }
};

const uploadTtd = async (req, res) => {
  try {
    const { id } = req.params;
    const { file_url } = req.body;
    
    if (!file_url) {
      return res.status(400).json({ success: false, message: 'URL file TTD diperlukan.' });
    }
    
    await PermohonanInspeksi.uploadTtd(id, file_url);
    res.json({ success: true, message: 'File TTD berhasil diunggah dan status diperbarui.' });
  } catch (error) {
    console.error('Upload TTD error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengunggah file TTD.' });
  }
};

const submitEvaluasi = async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal_evaluasi, file_evaluasi } = req.body;
    
    if (!tanggal_evaluasi || !file_evaluasi) {
      return res.status(400).json({ success: false, message: 'Tanggal dan file evaluasi diperlukan.' });
    }
    
    const CapaInspeksi = require('../models/CapaInspeksi');
    const capaRows = await CapaInspeksi.findByPermohonanId(id);
    const allClosed = capaRows.every(r => r.status_capa === 'Closed');
    const targetStatus = allClosed ? 'Inspeksi Selesai' : 'Menunggu Evaluasi';
    
    await PermohonanInspeksi.submitEvaluasiCapa(id, tanggal_evaluasi, file_evaluasi, targetStatus);
    res.json({ success: true, message: 'Evaluasi CAPA berhasil dikirim ke Pelaku Usaha.' });
  } catch (error) {
    console.error('Submit evaluasi error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengirim evaluasi CAPA.' });
  }
};

module.exports = {
  createPermohonan,
  getMyPermohonan,
  getPermohonanByPetugas,
  updateStatus,
  getInformasiPetugas,
  uploadTtd,
  submitEvaluasi,
};
