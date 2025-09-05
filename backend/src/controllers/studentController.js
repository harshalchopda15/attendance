const { Op } = require('sequelize');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');

async function markAttendance(req, res) {
  try {
    const { qr } = req.body;
    if (!qr) return res.status(400).json({ message: 'QR required' });
    
    let payload;
    try { 
      payload = JSON.parse(qr); 
    } catch { 
      return res.status(400).json({ message: 'Invalid QR format' }); 
    }

    console.log('QR payload received:', payload);

    // Find the class using the stored QR data that matches this payload
    const cls = await Class.findOne({ 
      where: { 
        qr_code: qr, // Match the exact QR string
        qr_expiry_time: { [Op.gt]: new Date() } // Check if not expired
      },
      order: [['id', 'DESC']] 
    });

    if (!cls) {
      console.log('Class not found for QR:', qr.substring(0, 100) + '...');
      return res.status(404).json({ message: 'Class not found or QR expired' });
    }

    console.log('Class found:', { id: cls.id, subject: cls.subject, teacher_id: cls.teacher_id });

    // Check if attendance already exists
    const exists = await Attendance.findOne({ 
      where: { student_id: req.user.id, class_id: cls.id } 
    });
    
    if (exists) {
      return res.status(200).json({ message: 'Attendance already marked' });
    }

    // Create attendance record
    const record = await Attendance.create({ 
      student_id: req.user.id, 
      class_id: cls.id 
    });

    console.log('Attendance marked successfully:', { student_id: req.user.id, class_id: cls.id });
    return res.status(201).json({ message: 'Attendance marked successfully', record });
    
  } catch (err) {
    console.error('Error marking attendance:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getMyAttendance(req, res) {
  try {
    const records = await Attendance.findAll({ 
      where: { student_id: req.user.id }, 
      include: [{ association: 'class' }] 
    });
    return res.json(records);
  } catch (err) {
    console.error('Error getting attendance:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { markAttendance, getMyAttendance };
