
const express = require('express');
const router = express.Router();
const motoristaController = require('../controllers/motoristaController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/eco-conducao', authMiddleware, motoristaController.ecoConducao);
router.post('/trocar-cdr-por-pix', authMiddleware, motoristaController.trocarCdrPorPix);

module.exports = router;
