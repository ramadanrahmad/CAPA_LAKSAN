const express = require('express');
const router = express.Router();
const sertifikasiController = require('../controllers/sertifikasiController');
const capaController = require('../controllers/capaController');
const authMiddleware = require('../middleware/auth');

// POST /api/sertifikasi/permohonan
router.post('/permohonan', authMiddleware, sertifikasiController.createPermohonan);

// GET /api/sertifikasi/permohonan/me
router.get('/permohonan/me', authMiddleware, sertifikasiController.getMyPermohonan);

// GET /api/sertifikasi/permohonan/petugas
router.get('/permohonan/petugas', authMiddleware, sertifikasiController.getPermohonanByPetugas);

// GET /api/sertifikasi/informasi/petugas
router.get('/informasi/petugas', authMiddleware, sertifikasiController.getInformasiPetugas);

// PUT /api/sertifikasi/permohonan/:id/status
router.put('/permohonan/:id/status', authMiddleware, sertifikasiController.updateStatus);

// POST /api/sertifikasi/capa
router.post('/capa', authMiddleware, capaController.createCapa);

// GET /api/sertifikasi/capa/:permohonan_id
router.get('/capa/:permohonan_id', authMiddleware, capaController.getCapaByPermohonan);

// PUT /api/sertifikasi/capa/:permohonan_id
router.put('/capa/:permohonan_id', authMiddleware, capaController.updateCapa);

module.exports = router;
