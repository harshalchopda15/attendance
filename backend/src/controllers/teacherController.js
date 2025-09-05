const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const User = require('../models/User');

async function createClassAndGenerateQR(req, res) {
  try {
    const { subject } = req.body;
    if (!subject) return res.status(400).json({ message: 'Subject required' });
    const now = new Date();
    const expiry = new Date(now.getTime() + Number(process.env.QR_TTL_SECONDS || 60) * 1000);
    const payload = { classId: uuidv4(), teacherId: req.user.id, subject, ts: now.getTime(), exp: expiry.getTime() };
    const qrString = JSON.stringify(payload);
    const dataUrl = await QRCode.toDataURL(qrString);

    const cls = await Class.create({ teacher_id: req.user.id, subject, date: now, qr_code: qrString, qr_expiry_time: expiry });

    return res.status(201).json({ classId: cls.id, subject: cls.subject, qr: dataUrl, expiresAt: expiry });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getAttendanceByClass(req, res) {
  try {
    const { classId } = req.params;
    const records = await Attendance.findAll({ where: { class_id: classId }, include: [{ association: 'student', attributes: ['id','name','email'] }] });
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getPresentStudents(req, res) {
  try {
    const { classId } = req.params;
    console.log('Fetching present students for class ID:', classId);
    
    const records = await Attendance.findAll({ 
      where: { class_id: classId }, 
      include: [{ 
        model: User,
        as: 'student',
        attributes: ['id','name','email','role']
      }] 
    });
    
    console.log('Raw attendance records:', records.length);
    console.log('Sample record:', records[0] ? {
      id: records[0].id,
      student_id: records[0].student_id,
      class_id: records[0].class_id,
      student: records[0].student
    } : 'No records');
    
    // Filter only students and extract student information
    const presentStudents = records
      .filter(record => {
        const isStudent = record.student && record.student.role === 'student';
        console.log('Record student check:', {
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
    
    console.log('Filtered present students:', presentStudents.length);
    return res.json(presentStudents);
  } catch (err) {
    console.error('Error in getPresentStudents:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function debugAttendance(req, res) {
  try {
    const { classId } = req.params;
    console.log('=== DEBUG ATTENDANCE ===');
    console.log('Class ID:', classId);
    
    // Test 1: Get raw attendance records
    const rawAttendance = await Attendance.findAll({ 
      where: { class_id: classId }
    });
    console.log('Raw attendance count:', rawAttendance.length);
    console.log('Raw attendance sample:', rawAttendance[0]);
    
    // Test 2: Get attendance with student include
    const attendanceWithStudent = await Attendance.findAll({ 
      where: { class_id: classId },
      include: [{ 
        model: User,
        as: 'student',
        attributes: ['id','name','email','role']
      }]
    });
    console.log('Attendance with student count:', attendanceWithStudent.length);
    console.log('Attendance with student sample:', attendanceWithStudent[0]);
    
    // Test 3: Get all users to verify they exist
    const allUsers = await User.findAll({ attributes: ['id','name','email','role'] });
    console.log('All users count:', allUsers.length);
    console.log('All users:', allUsers);
    
    // Test 4: Get students only
    const students = await User.findAll({ 
      where: { role: 'student' },
      attributes: ['id','name','email','role']
    });
    console.log('Students count:', students.length);
    console.log('Students:', students);
    
    return res.json({
      rawAttendance: rawAttendance.length,
      attendanceWithStudent: attendanceWithStudent.length,
      allUsers: allUsers.length,
      students: students.length,
      sampleAttendance: rawAttendance[0],
      sampleAttendanceWithStudent: attendanceWithStudent[0],
      allUsersList: allUsers,
      studentsList: students
    });
  } catch (err) {
    console.error('Debug error:', err);
    return res.status(500).json({ message: 'Debug error', error: err.message });
  }
}

module.exports = { createClassAndGenerateQR, getAttendanceByClass, getPresentStudents, debugAttendance };
