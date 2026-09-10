const PermohonanSertifikasi = require('../models/PermohonanSertifikasi');

/**
 * Create new Permohonan Sertifikasi
 * POST /api/sertifikasi/permohonan
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
      jenis_komoditi,
    } = req.body;

    // Validate required fields
    if (!nama_sarana || !alamat_sarana || !no_hp || !email || !penanggung_jawab_id || !kabupaten_kota || !jenis_komoditi) {
      return res.status(400).json({
        success: false,
        message: 'Mohon lengkapi semua field yang wajib diisi.',
      });
    }

    const insertId = await PermohonanSertifikasi.create({
      user_id,
      nama_sarana,
      alamat_sarana,
      no_hp,
      email_sarana: email,
      penanggung_jawab_id,
      tanggal_pemeriksaan,
      tanggal_terima,
      kabupaten_kota,
      jenis_komoditi,
    });

    res.status(201).json({
      success: true,
      message: 'Permohonan Sertifikasi berhasil dikirim!',
      data: { id: insertId }
    });

  } catch (error) {
    console.error('Create permohonan error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menyimpan permohonan.',
    });
  }
};

/**
 * Get Permohonan by User ID
 * GET /api/sertifikasi/permohonan/me
 */
const getMyPermohonan = async (req, res) => {
  try {
    const user_id = req.user.id;
    const data = await PermohonanSertifikasi.findByUserId(user_id);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get my permohonan error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data permohonan.',
    });
  }
};

/**
 * Get Permohonan by Petugas ID
 * GET /api/sertifikasi/permohonan/petugas
 */
const getPermohonanByPetugas = async (req, res) => {
  try {
    const petugas_id = req.user.id;
    const data = await PermohonanSertifikasi.findByPenanggungJawab(petugas_id);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get permohonan by petugas error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil antrean permohonan.',
    });
  }
};

/**
 * Get Informasi for Petugas (Aggregated Table Data)
 * GET /api/sertifikasi/informasi/petugas
 */
const getInformasiPetugas = async (req, res) => {
  try {
    const petugas_id = req.user.id;
    const data = await PermohonanSertifikasi.getInformasiByPetugas(petugas_id);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get informasi petugas error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data informasi.',
    });
  }
};

/**
 * Update Status
 * PUT /api/sertifikasi/permohonan/:id/status
 */
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const permohonan = await PermohonanSertifikasi.findById(id);
    
    // If transitioning from Petugas evaluation to Pelaku Usaha or Upload File, save history
    if ((status === 'Menunggu Evaluasi' || status === 'Upload File') && permohonan && permohonan.status === 'Perlu Evaluasi') {
      const CapaSertifikasi = require('../models/CapaSertifikasi');
      await CapaSertifikasi.snapshotHistory(id, permohonan.tahap);
      await PermohonanSertifikasi.incrementTahap(id);
    }
    
    await PermohonanSertifikasi.updateStatus(id, status);
    
    res.json({
      success: true,
      message: 'Status berhasil diperbarui'
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui status.',
    });
  }
};

module.exports = {
  createPermohonan,
  getMyPermohonan,
  getPermohonanByPetugas,
  getInformasiPetugas,
  updateStatus,
};
