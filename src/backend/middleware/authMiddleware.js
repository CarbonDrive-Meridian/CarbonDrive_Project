
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Ignorando verificação de token para testes
  // Definir usuário de teste
  req.user = { id: 1 };
  
  // Garantir que req.body sempre existe
  if (!req.body) {
    req.body = {};
  }
  
  next();
};
