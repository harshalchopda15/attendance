const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { createClassAndGenerateQR, getAttendanceByClass, getPresentStudents, debugAttendance } = require('../controllers/teacherController');

router.post('/generate-qr', authenticate, authorize(['teacher']), createClassAndGenerateQR);
router.get('/attendance/:classId', authenticate, authorize(['teacher','admin']), getAttendanceByClass);
router.get('/present-students/:classId', authenticate, authorize(['teacher','admin']), getPresentStudents);
router.get('/debug/:classId', authenticate, authorize(['teacher','admin']), debugAttendance);

module.exports = router;
