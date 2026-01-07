import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Input validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log('Registration attempt:', { name, email, role });
    
    // Input validation
    if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
      console.log('Invalid input format');
      return res.status(400).json({ msg: 'Invalid input format' });
    }
    
    if (!name.trim() || !validateEmail(email) || !validatePassword(password)) {
      console.log('Validation failed:', { name: !!name.trim(), email: validateEmail(email), password: validatePassword(password) });
      return res.status(400).json({ msg: 'Please provide valid name, email and password (min 6 chars)' });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });
    
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hash,
      role: role || 'student'
    });
    
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ msg: 'Invalid input format' });
    }
    
    if (!validateEmail(email) || !password) {
      return res.status(400).json({ msg: 'Please provide valid email and password' });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ msg: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all students (Admin only)
router.get('/students', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;