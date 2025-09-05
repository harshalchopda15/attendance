const { fn, col } = require('sequelize');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');

async function listUsers(req, res) {
  const users = await User.findAll({ attributes: ['id','name','email','role'] });
  return res.json(users);
}

async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ message: 'Missing fields' });
  try {
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateUser(req, res) {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    const { name, email, role } = req.body;
    await user.update({ name, email, role });
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    await user.destroy();
    return res.json({ message: 'Deleted' });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function reports(req, res) {
  try {
    const data = await Attendance.findAll({
      attributes: ['class_id', [fn('COUNT', col('Attendance.id')), 'presentCount']],
      group: ['class_id'],
      include: [{ association: 'class', attributes: ['id','subject','date','teacher_id'] }],
    });
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getPresentStudents(req, res) {
  try {
    const { classId } = req.params;
    console.log('Admin fetching present students for class ID:', classId);
    
    const records = await Attendance.findAll({ 
      where: { class_id: classId }, 
      include: [{ 
        model: User,
        as: 'student',
        attributes: ['id','name','email','role']
      }] 
    });
    
    console.log('Admin raw attendance records:', records.length);
    
    // Filter only students and extract student information
    const presentStudents = records
      .filter(record => {
        const isStudent = record.student && record.student.role === 'student';
        console.log('Admin record student check:', {
          hasStudent: !!record.student,
          role: record.student?.role,
          isStudent
        });
        return isStudent;
      })
      .map(record => ({
        id: record.student.id,
        name: record.student.name,
        email: record.student.email,
        timestamp: record.timestamp
      }));
    
    console.log('Admin filtered present students:', presentStudents.length);
    return res.json(presentStudents);
  } catch (err) {
    console.error('Error in admin getPresentStudents:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { listUsers, createUser, updateUser, deleteUser, reports, getPresentStudents };
