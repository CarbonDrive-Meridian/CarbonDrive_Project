
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pix_key: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stellar_public_key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  stellar_secret_key_encrypted: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = User;
