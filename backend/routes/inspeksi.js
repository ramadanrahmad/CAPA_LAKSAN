const express = require('express');
const router = express.Router();
const inspeksiController = require('../controllers/inspeksiController');
const authMiddleware = require('../middleware/auth');

// POST /api/inspeksi/permohonan
router.post('/permohonan', authMiddleware, inspeksiController.createPermohonan);

// GET /api/inspeksi/permohonan/me
router.get('/permohonan/me', authMiddleware, inspeksiController.getMyPermohonan);

// GET /api/inspeksi/permohonan/petugas
router.get('/permohonan/petugas', authMiddleware, inspeksiController.getPermohonanByPetugas);

// PUT /api/inspeksi/permohonan/:id/status
router.put('/permohonan/:id/status', authMiddleware, inspeksiController.updateStatus);

// PUT /api/inspeksi/permohonan/:id/upload-ttd
router.put('/permohonan/:id/upload-ttd', authMiddleware, inspeksiController.uploadTtd);

// PUT /api/inspeksi/permohonan/:id/submit-evaluasi
router.put('/permohonan/:id/submit-evaluasi', authMiddleware, inspeksiController.submitEvaluasi);

// GET /api/inspeksi/informasi/petugas
router.get('/informasi/petugas', authMiddleware, inspeksiController.getInformasiPetugas);

// --- CAPA Routes ---
const capaInspeksiController = require('../controllers/capaInspeksiController');

// POST /api/inspeksi/capa
router.post('/capa', authMiddleware, capaInspeksiController.createCapa);

// GET /api/inspeksi/capa/:permohonan_id
router.get('/capa/:permohonan_id', authMiddleware, capaInspeksiController.getCapaByPermohonan);

// PUT /api/inspeksi/capa/:permohonan_id
router.put('/capa/:permohonan_id', authMiddleware, capaInspeksiController.updateCapa);

module.exports = router;
