
require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const motoristaRoutes = require('./routes/motorista');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(express.json());

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
