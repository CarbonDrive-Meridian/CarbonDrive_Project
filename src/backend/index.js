
require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const motoristaRoutes = require('./routes/motorista');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(express.json());

// Middleware para garantir que o corpo da requisição seja sempre um objeto válido
app.use((req, res, next) => {
  if (req.method === 'POST' && !req.body) {
    req.body = {};
  }
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/motorista', motoristaRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
