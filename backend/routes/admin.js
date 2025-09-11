import express from 'express';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Middleware to check admin role
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }
  next();
};

// Get pending recruiter approvals
router.get('/recruiters/pending', auth, adminOnly, async (req, res) => {
  try {
    const pendingRecruiters = await User.find({
      role: 'recruiter',
      'recruiterProfile.isApproved': false,
      'recruiterProfile.companyName': { $exists: true }
    }).select('-password');

    res.json(pendingRecruiters);
  } catch (error) {
    console.error('Get pending recruiters error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Approve/Reject recruiter
router.put('/recruiters/:recruiterId/approve', auth, adminOnly, async (req, res) => {
  try {
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ msg: 'Invalid action. Use approve or reject.' });
    }

    const recruiter = await User.findById(req.params.recruiterId);
    if (!recruiter || recruiter.role !== 'recruiter') {
      return res.status(404).json({ msg: 'Recruiter not found' });
    }

    if (action === 'approve') {
      recruiter.recruiterProfile.isApproved = true;
      recruiter.recruiterProfile.approvedBy = req.user.id;
      recruiter.recruiterProfile.approvedAt = new Date();
    } else {
      recruiter.recruiterProfile.rejectionReason = rejectionReason;
    }

    await recruiter.save();

    // Create notification for recruiter
    await Notification.create({
      recipient: recruiter._id,
      sender: req.user.id,
      type: action === 'approve' ? 'profile_approved' : 'profile_rejected',
      title: `Recruiter Profile ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      message: action === 'approve' 
        ? 'Your recruiter profile has been approved. You can now post jobs.'
        : `Your recruiter profile has been rejected. Reason: ${rejectionReason}`,
      actionRequired: action === 'reject',
      actionUrl: action === 'reject' ? '/recruiter/profile' : '/recruiter/dashboard',
      actionText: action === 'reject' ? 'Update Profile' : 'View Dashboard'
    });

    res.json({
      msg: `Recruiter ${action}d successfully`,
      recruiter
    });
  } catch (error) {
    console.error('Approve recruiter error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all users with filters
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const { role, page = 1, limit = 10, search } = req.query;
    
    let filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get placement statistics
router.get('/reports/placement', auth, adminOnly, async (req, res) => {
  try {
    const { year, branch } = req.query;

    // Overall statistics
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRecruiters = await User.countDocuments({ 
      role: 'recruiter', 
      'recruiterProfile.isApproved': true 
    });
    const totalJobs = await Job.countDocuments({ status: 'active' });

    // Placement statistics
    const placedStudents = await Application.countDocuments({ status: 'selected' });
    const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(2) : 0;

    // Branch-wise statistics
    const branchWiseStats = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: '$studentProfile.branch',
          totalStudents: { $sum: 1 },
          avgCGPA: { $avg: '$studentProfile.cgpa' }
        }
      }
    ]);

    // Branch-wise placements
    const branchWisePlacements = await Application.aggregate([
      { $match: { status: 'selected' } },
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentDetails'
        }
      },
      { $unwind: '$studentDetails' },
      {
        $group: {
          _id: '$studentDetails.studentProfile.branch',
          placedCount: { $sum: 1 },
          avgCTC: { $avg: '$offerDetails.ctc' }
        }
      }
    ]);

    // Monthly application trends
    const applicationTrends = await Application.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$appliedAt' },
            month: { $month: '$appliedAt' }
          },
          applications: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top companies by placements
    const topCompanies = await Application.aggregate([
      { $match: { status: 'selected' } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobDetails'
        }
      },
      { $unwind: '$jobDetails' },
      {
        $lookup: {
          from: 'users',
          localField: 'jobDetails.company',
          foreignField: '_id',
          as: 'companyDetails'
        }
      },
      { $unwind: '$companyDetails' },
      {
        $group: {
          _id: '$companyDetails.recruiterProfile.companyName',
          placements: { $sum: 1 },
          avgCTC: { $avg: '$offerDetails.ctc' }
        }
      },
      { $sort: { placements: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      overview: {
        totalStudents,
        totalRecruiters,
        totalJobs,
        placedStudents,
        placementRate: parseFloat(placementRate)
      },
      branchWiseStats,
      branchWisePlacements,
      applicationTrends,
      topCompanies
    });
  } catch (error) {
    console.error('Get placement reports error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create announcement
router.post('/announcements', auth, adminOnly, async (req, res) => {
  try {
    const {
      title,
      content,
      targetAudience,
      targetBranches,
      targetYears,
      type,
      priority,
      scheduledFor,
      expiresAt,
      isPinned,
      allowComments,
      sendNotification
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ msg: 'Title and content are required' });
    }

    const announcement = new Announcement({
      title,
      content,
      author: req.user.id,
      targetAudience,
      targetBranches,
      targetYears,
      type,
      priority,
      scheduledFor,
      expiresAt,
      isPinned,
      allowComments,
      sendNotification,
      isPublished: !scheduledFor, // Publish immediately if not scheduled
      publishedAt: !scheduledFor ? new Date() : null
    });

    await announcement.save();

    // Send notifications if enabled
    if (sendNotification && !scheduledFor) {
      let recipients = [];
      
      if (targetAudience === 'all') {
        recipients = await User.find({ role: { $in: ['student', 'recruiter'] } }).select('_id');
      } else if (targetAudience === 'students') {
        recipients = await User.find({ role: 'student' }).select('_id');
      } else if (targetAudience === 'recruiters') {
        recipients = await User.find({ role: 'recruiter' }).select('_id');
      } else if (targetAudience === 'specific_branch') {
        recipients = await User.find({ 
          role: 'student',
          'studentProfile.branch': { $in: targetBranches }
        }).select('_id');
      } else if (targetAudience === 'specific_year') {
        recipients = await User.find({ 
          role: 'student',
          'studentProfile.year': { $in: targetYears }
        }).select('_id');
      }

      // Create notifications for all recipients
      const notifications = recipients.map(recipient => ({
        recipient: recipient._id,
        sender: req.user.id,
        type: 'announcement',
        title: title,
        message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        priority
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(201).json({
      msg: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all announcements
router.get('/announcements', auth, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const announcements = await Announcement.find({})
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Announcement.countDocuments({});

    res.json({
      announcements,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin dashboard stats
router.get('/dashboard', auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const pendingApprovals = await User.countDocuments({ 
      role: 'recruiter', 
      'recruiterProfile.isApproved': false,
      'recruiterProfile.companyName': { $exists: true }
    });
    
    const totalJobs = await Job.countDocuments({});
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const totalApplications = await Application.countDocuments({});
    const successfulPlacements = await Application.countDocuments({ status: 'selected' });

    // Recent activity
    const recentApplications = await Application.find({})
      .populate('student', 'name')
      .populate('job', 'title')
      .sort({ appliedAt: -1 })
      .limit(5);

    res.json({
      overview: {
        totalUsers,
        totalStudents,
        totalRecruiters,
        pendingApprovals,
        totalJobs,
        activeJobs,
        totalApplications,
        successfulPlacements
      },
      recentActivity: recentApplications
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;