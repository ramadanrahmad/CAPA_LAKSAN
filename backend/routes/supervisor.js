const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/supervisorController');
const authMiddleware = require('../middleware/auth');

const checkSupervisor = (req, res, next) => {
  if (req.user.role !== 'petugas' || req.user.petugas_role !== 'supervisor') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Anda bukan supervisor.' });
  }
  next();
};

router.use(authMiddleware, checkSupervisor);

router.get('/antrean', supervisorController.getAllAntrean);
router.get('/sertifikasi-selesai', supervisorController.getSertifikasiSelesai);
router.get('/inspeksi-selesai', supervisorController.getInspeksiSelesai);
router.get('/informasi', supervisorController.getInformasi);

module.exports = router;
