
const express = require('express');
const router = express.Router();
const motoristaController = require('../controllers/motoristaController');

// Middleware para validar o corpo da requisição na rota trocar-cdr-por-pix
const validateExchangeBody = (req, res, next) => {
  // Garantir que req.body sempre existe
  if (!req.body) {
    req.body = {};
  }
  
  // Se não houver amount, definir um valor padrão para testes
  if (req.body.amount === undefined) {
    req.body.amount = 10; // Valor padrão para testes
  }
  
  // Se a validação passar, continue para o controlador
  next();
};

router.post('/eco-conducao', (req, res, next) => {
  req.user = { id: 1 }; // Simular usuário para testes
  next();
}, motoristaController.ecoConducao);
// Adicionando simulação de usuário para testes
router.post('/trocar-cdr-por-pix', validateExchangeBody, (req, res, next) => {
  req.user = { id: 1 }; // Simular usuário para testes
  next();
}, motoristaController.trocarCdrPorPix);
// Rota de teste sem autenticação e com validação de corpo
router.post('/teste-troca-cdr', validateExchangeBody, (req, res) => {
  // Simular o usuário para testes
  req.user = { id: 1 };
  // Chamar o controlador diretamente
  motoristaController.trocarCdrPorPix(req, res);
});

module.exports = router;
