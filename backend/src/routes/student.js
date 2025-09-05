const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { markAttendance, getMyAttendance } = require('../controllers/studentController');

router.post('/mark-attendance', authenticate, authorize(['student','teacher']), markAttendance);
router.get('/my-attendance', authenticate, authorize(['student','teacher']), getMyAttendance);

module.exports = router;
