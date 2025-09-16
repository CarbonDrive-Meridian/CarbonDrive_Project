
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const jwt = require('jsonwebtoken');

router.post('/login', authController.login);
router.post('/register', authController.register);

// Rota temporária para gerar token de teste
router.get('/test-token', (req, res) => {
  const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);
  res.json({ token });
});

module.exports = router;
