const CapaSertifikasi = require('../models/CapaSertifikasi');
const PermohonanSertifikasi = require('../models/PermohonanSertifikasi');

const createCapa = async (req, res) => {
  try {
    const { permohonan_id, temuanList } = req.body;
    
    // Prepare rows for DB
    const rows = temuanList.map(item => ({
      permohonan_id,
      temuan: item.temuan,
      kriteria: item.kriteria,
      persyaratan: item.persyaratan
    }));

    await CapaSertifikasi.createBulk(rows);
    
    // Update status to 'Menunggu Evaluasi'
    await PermohonanSertifikasi.updateStatus(permohonan_id, 'Menunggu Evaluasi');

    res.status(201).json({
      success: true,
      message: 'CAPA berhasil dikirim ke Pelaku Usaha.'
    });
  } catch (error) {
    console.error('Create CAPA error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menyimpan CAPA.',
    });
  }
};

const getCapaByPermohonan = async (req, res) => {
  try {
    const { permohonan_id } = req.params;
    const rows = await CapaSertifikasi.findByPermohonanId(permohonan_id);
    const historyRows = await CapaSertifikasi.findHistoryByPermohonanId(permohonan_id);
    const PermohonanSertifikasi = require('../models/PermohonanSertifikasi');
    const permohonan = await PermohonanSertifikasi.findById(permohonan_id);
    
    // Group history by tahap
    const history = {};
    historyRows.forEach(row => {
      if (!history[row.tahap]) history[row.tahap] = [];
      history[row.tahap].push(row);
    });
    
    res.json({
      success: true,
      data: rows,
      history: history,
      permohonan: permohonan
    });
  } catch (error) {
    console.error('Get CAPA error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data CAPA.',
    });
  }
};

const updateCapa = async (req, res) => {
  try {
    const { permohonan_id } = req.params;
    const { temuanList, targetStatus } = req.body;

    // Update CAPA rows
    await CapaSertifikasi.updateBulk(temuanList);
    
    // Snapshot history if Petugas is evaluating (targetStatus is Menunggu Evaluasi or Upload File)
    if (targetStatus === 'Menunggu Evaluasi' || targetStatus === 'Upload File') {
      const permohonan = await PermohonanSertifikasi.findById(permohonan_id);
      if (permohonan && permohonan.status === 'Perlu Evaluasi') {
        await CapaSertifikasi.snapshotHistory(permohonan_id, permohonan.tahap);
        await PermohonanSertifikasi.incrementTahap(permohonan_id);
      }
    }

    // Update Permohonan Status
    if (targetStatus) {
      await PermohonanSertifikasi.updateStatus(permohonan_id, targetStatus);
      if (targetStatus === 'Perlu Evaluasi') {
        await PermohonanSertifikasi.updateTanggalCapa(permohonan_id);
      }
    }

    res.json({
      success: true,
      message: 'CAPA berhasil diperbarui.'
    });
  } catch (error) {
    console.error('Update CAPA error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui CAPA.',
    });
  }
};

module.exports = {
  createCapa,
  getCapaByPermohonan,
  updateCapa,
};
