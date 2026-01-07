import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import studentRoutes from './routes/students.js';
import recruiterRoutes from './routes/recruiters.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import companyRoutes from './routes/companies.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directories if they don't exist
import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads');
const resumesDir = path.join(__dirname, 'uploads/resumes');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir);
}

// Rate limiting middleware (simple implementation)
const rateLimit = (req, res, next) => {
  // Simple rate limiting - can be enhanced with redis
  next();
};
app.use(rateLimit);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0'
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Placement Portal API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth - Authentication routes',
      jobs: '/api/jobs - Job management',
      applications: '/api/applications - Application management',
      students: '/api/students - Student specific routes',
      recruiters: '/api/recruiters - Recruiter specific routes',
      admin: '/api/admin - Admin specific routes',
      notifications: '/api/notifications - Notification management',
      companies: '/api/companies - Company management for MBM University'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      msg: 'Validation error', 
      errors: Object.values(err.errors).map(e => e.message) 
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ msg: 'Invalid ID format' });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ msg: `${field} already exists` });
  }
  
  if (err.message && err.message.includes('PDF')) {
    return res.status(400).json({ msg: err.message });
  }
  
  res.status(500).json({ msg: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ msg: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is required in environment variables');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is required in environment variables');
  process.exit(1);
}

// Database connection with proper error handling
mongoose.connect(process.env.MONGO_URI, {
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  
  app.listen(PORT, () => {
    console.log(`🚀 Placement Portal Server running on port ${PORT}`);
    console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
    console.log('🎯 Features: Student Portal, Recruiter Dashboard, Admin Panel');
  });
})
.catch(err => {
  console.error('❌ Database connection failed:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});