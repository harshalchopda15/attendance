const express = require('express');
const router = express.Router();
const { signup, login, logout, signupValidations, loginValidations } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/signup', signupValidations, signup);
router.post('/login', loginValidations, login);
router.post('/logout', logout);

// Simple endpoint to inspect current authenticated user
router.get('/whoami', authenticate, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
