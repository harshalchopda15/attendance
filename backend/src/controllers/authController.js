const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const signupValidations = [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('role').isIn(['student','teacher','admin']),
];

async function signup(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

const loginValidations = [
  body('email').isEmail(),
  body('password').notEmpty(),
];

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const secure = String(process.env.COOKIE_SECURE).toLowerCase() === 'true';
    const sameSite = process.env.COOKIE_SAMESITE || 'Lax';
    res.cookie('token', token, { httpOnly: true, sameSite, secure });
    return res.json({ token, role: user.role, name: user.name, email: user.email });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

function logout(req, res) {
  res.clearCookie('token');
  return res.json({ message: 'Logged out' });
}

module.exports = { signup, login, logout, signupValidations, loginValidations };
