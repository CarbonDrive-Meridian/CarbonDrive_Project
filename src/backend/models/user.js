
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
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
  user_type: {
    type: DataTypes.ENUM('driver', 'company'),
    allowNull: true,
  },
  pix_key: {
    type: DataTypes.STRING,
    allowNull: true,
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
