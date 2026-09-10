const Petugas = require('../models/Petugas');

/**
 * Get Petugas by Role
 * GET /api/petugas?role=sertifikasi
 */
const getPetugasByRole = async (req, res) => {
  try {
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Parameter role diperlukan.',
      });
    }

    const petugas = await Petugas.findByRole(role);

    res.json({
      success: true,
      data: petugas,
    });
  } catch (error) {
    console.error('Get petugas by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data petugas.',
    });
  }
};

module.exports = {
  getPetugasByRole,
};
