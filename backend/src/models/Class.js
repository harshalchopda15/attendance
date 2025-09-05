const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Class = sequelize.define('Class', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  teacher_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  subject: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
  qr_code: { type: DataTypes.STRING(1024), allowNull: true },
  qr_expiry_time: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'classes', timestamps: false });

Class.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });

module.exports = Class;
