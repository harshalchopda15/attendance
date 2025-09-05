const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { listUsers, createUser, updateUser, deleteUser, reports, getPresentStudents } = require('../controllers/adminController');

router.get('/users', authenticate, authorize(['admin','teacher']), listUsers);
router.post('/users', authenticate, authorize(['admin']), createUser);
router.put('/users/:id', authenticate, authorize(['admin']), updateUser);
router.delete('/users/:id', authenticate, authorize(['admin']), deleteUser);
router.get('/reports', authenticate, authorize(['admin','teacher']), reports);
router.get('/present-students/:classId', authenticate, authorize(['admin']), getPresentStudents);

module.exports = router;
