
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware'); // Could be a different admin middleware

router.post('/vender-lote-empresas', authMiddleware, adminController.venderLoteEmpresas);

module.exports = router;
