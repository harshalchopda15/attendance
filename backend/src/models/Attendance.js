const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Class = require('./Class');

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  class_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'classes', key: 'id' } },
  timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'attendance', timestamps: false });

Attendance.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Attendance.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });

module.exports = Attendance;
