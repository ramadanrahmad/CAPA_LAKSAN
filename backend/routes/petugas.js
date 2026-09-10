const express = require('express');
const router = express.Router();
const petugasController = require('../controllers/petugasController');
const authMiddleware = require('../middleware/auth');

// GET /api/petugas?role=sertifikasi
router.get('/', authMiddleware, petugasController.getPetugasByRole);

module.exports = router;
