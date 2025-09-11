import express from 'express';
import User from '../models/User.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import auth from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// File upload configuration for resumes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${req.user.id}-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Get student profile
router.get('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Access denied. Students only.' });
    }

    const student = await User.findById(req.user.id).select('-password');
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update student profile
router.put('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Access denied. Students only.' });
    }

    const {
      name,
      studentProfile: {
        rollNumber,
        college,
        branch,
        year,
        cgpa,
        skills,
        portfolio,
        phone,
        address,
        dateOfBirth,
        gender
      },
      linkedin,
      github
    } = req.body;

    // Check profile completion
    const isProfileComplete = !!(
      name && rollNumber && college && branch && year && 
      cgpa && phone && skills && skills.length > 0
    );

    const updatedStudent = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        'studentProfile.rollNumber': rollNumber,
        'studentProfile.college': college,
        'studentProfile.branch': branch,
        'studentProfile.year': year,
        'studentProfile.cgpa': cgpa,
        'studentProfile.skills': skills,
        'studentProfile.portfolio': portfolio,
        'studentProfile.phone': phone,
        'studentProfile.address': address,
        'studentProfile.dateOfBirth': dateOfBirth,
        'studentProfile.gender': gender,
        'studentProfile.isProfileComplete': isProfileComplete,
        linkedin,
        github
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      msg: 'Profile updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Upload resume
router.post('/upload-resume', auth, upload.single('resume'), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Access denied. Students only.' });
    }

    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a PDF file' });
    }

    const resumePath = `/uploads/resumes/${req.file.filename}`;

    await User.findByIdAndUpdate(req.user.id, {
      'studentProfile.resume': resumePath
    });

    res.json({
      msg: 'Resume uploaded successfully',
      resumePath
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get student applications
router.get('/applications', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Access denied. Students only.' });
    }

    const applications = await Application.find({ student: req.user.id })
      .populate({
        path: 'job',
        select: 'title company location ctc applicationDeadline status',
        populate: {
          path: 'company',
          select: 'name recruiterProfile.companyName'
        }
      })
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get eligible jobs for student
router.get('/eligible-jobs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Access denied. Students only.' });
    }

    const student = await User.findById(req.user.id);
    if (!student.studentProfile.isProfileComplete) {
      return res.status(400).json({ msg: 'Please complete your profile first' });
    }

    const { branch, cgpa, year } = student.studentProfile;

    // Find jobs that match student's eligibility
    const eligibleJobs = await Job.find({
      status: 'active',
      isApproved: true,
      applicationDeadline: { $gte: new Date() },
      $or: [
        { 'eligibilityCriteria.allowedBranches': { $in: [branch, 'ALL'] } },
        { 'eligibilityCriteria.allowedBranches': { $size: 0 } }
      ],
      $or: [
        { 'eligibilityCriteria.minCGPA': { $lte: cgpa } },
        { 'eligibilityCriteria.minCGPA': { $exists: false } }
      ]
    })
    .populate('company', 'name recruiterProfile.companyName recruiterProfile.companyLogo')
    .sort({ createdAt: -1 });

    res.json(eligibleJobs);
  } catch (error) {
    console.error('Get eligible jobs error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get application statistics
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Access denied. Students only.' });
    }

    const stats = await Application.aggregate([
      { $match: { student: req.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalApplications = await Application.countDocuments({ student: req.user.id });
    const profileViews = await User.findById(req.user.id).select('profileViews');

    res.json({
      totalApplications,
      profileViews: profileViews.profileViews || 0,
      statusBreakdown: stats
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;