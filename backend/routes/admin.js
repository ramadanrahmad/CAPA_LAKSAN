const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');

// All routes are protected by authMiddleware and isAdmin middlewares
router.use(authMiddleware, isAdmin);

// CRUD routes for Petugas
router.get('/petugas', adminController.getAllPetugas);
router.post('/petugas', adminController.createPetugas);
router.put('/petugas/:id', adminController.updatePetugas);
router.delete('/petugas/:id', adminController.deletePetugas);

module.exports = router;
