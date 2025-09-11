import express from 'express';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Register as recruiter (additional profile setup)
router.post('/register', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ msg: 'Access denied. Recruiters only.' });
    }

    const {
      companyName,
      companyDescription,
      website,
      industry,
      companySize,
      location,
      contactPerson,
      designation
    } = req.body;

    if (!companyName || !companyDescription || !industry || !location) {
      return res.status(400).json({ msg: 'Please provide all required company details' });
    }

    const updatedRecruiter = await User.findByIdAndUpdate(
      req.user.id,
      {
        'recruiterProfile.companyName': companyName,
        'recruiterProfile.companyDescription': companyDescription,
        'recruiterProfile.website': website,
        'recruiterProfile.industry': industry,
        'recruiterProfile.companySize': companySize,
        'recruiterProfile.location': location,
        'recruiterProfile.contactPerson': contactPerson,
        'recruiterProfile.designation': designation
      },
      { new: true, runValidators: true }
    ).select('-password');

    // Create notification for admin
    await Notification.create({
      recipient: await User.findOne({ role: 'admin' }).select('_id'),
      sender: req.user.id,
      type: 'profile_approval_required',
      title: 'New Recruiter Registration',
      message: `${companyName} has registered and needs approval`,
      actionRequired: true,
      actionUrl: `/admin/recruiters/${req.user.id}`,
      actionText: 'Review Application'
    });

    res.json({
      msg: 'Recruiter profile submitted for approval',
      recruiter: updatedRecruiter
    });
  } catch (error) {
    console.error('Recruiter registration error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get recruiter profile
router.get('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ msg: 'Access denied. Recruiters only.' });
    }

    const recruiter = await User.findById(req.user.id).select('-password');
    res.json(recruiter);
  } catch (error) {
    console.error('Get recruiter profile error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create job posting
router.post('/jobs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ msg: 'Access denied. Recruiters only.' });
    }

    const recruiter = await User.findById(req.user.id);
    if (!recruiter.recruiterProfile.isApproved) {
      return res.status(403).json({ msg: 'Your recruiter profile is not approved yet' });
    }

    const {
      title,
      description,
      location,
      jobType,
      workMode,
      ctc,
      eligibilityCriteria,
      requirements,
      responsibilities,
      benefits,
      applicationDeadline,
      maxApplications,
      jobDescription,
      selectionProcess,
      contactEmail
    } = req.body;

    if (!title || !description || !ctc || !applicationDeadline) {
      return res.status(400).json({ msg: 'Please provide all required job details' });
    }

    const job = new Job({
      title,
      description,
      company: req.user.id,
      location,
      jobType,
      workMode,
      ctc,
      eligibilityCriteria,
      requirements,
      responsibilities,
      benefits,
      applicationDeadline,
      maxApplications,
      jobDescription,
      selectionProcess,
      contactEmail: contactEmail || recruiter.email,
      status: 'active'
    });

    await job.save();
    await job.populate('company', 'name recruiterProfile.companyName');

    res.status(201).json({
      msg: 'Job posted successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get recruiter's jobs
router.get('/jobs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ msg: 'Access denied. Recruiters only.' });
    }

    const jobs = await Job.find({ company: req.user.id })
      .populate('company', 'name recruiterProfile.companyName')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error('Get recruiter jobs error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get applications for a specific job
router.get('/jobs/:jobId/applications', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ msg: 'Access denied. Recruiters only.' });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job || job.company.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Job not found or access denied' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    let filter = { job: req.params.jobId };
    
    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate({
        path: 'student',
        select: 'name email studentProfile',
      })
      .populate('job', 'title')
      .sort({ appliedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(filter);

    res.json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update application status (shortlist/reject)
router.put('/applications/:applicationId/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ msg: 'Access denied. Recruiters only.' });
    }

    const { status, recruiterNotes, rejectionReason, interview } = req.body;
    
    const application = await Application.findById(req.params.applicationId)
      .populate('job')
      .populate('student');

    if (!application || application.job.company.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Application not found or access denied' });
    }

    const validStatuses = ['under_review', 'shortlisted', 'interview_scheduled', 'interviewed', 'selected', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    // Update application
    application.status = status;
    application.recruiterNotes = recruiterNotes;
    application.lastUpdated = new Date();

    if (status === 'shortlisted') {
      application.shortlistedAt = new Date();
      application.shortlistedBy = req.user.id;
    }

    if (status === 'rejected') {
      application.rejectionReason = rejectionReason;
    }

    if (status === 'interview_scheduled' && interview) {
      application.interview = {
        ...application.interview,
        ...interview,
        isScheduled: true
      };
    }

    // Add to status history
    application.statusHistory.push({
      status,
      updatedBy: req.user.id,
      note: recruiterNotes || rejectionReason
    });

    await application.save();

    // Create notification for student
    await Notification.create({
      recipient: application.student._id,
      sender: req.user.id,
      type: 'application_status_update',
      title: `Application Status Updated`,
      message: `Your application for ${application.job.title} has been ${status.replace('_', ' ')}`,
      relatedJob: application.job._id,
      relatedApplication: application._id
    });

    res.json({
      msg: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get recruiter dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ msg: 'Access denied. Recruiters only.' });
    }

    const totalJobs = await Job.countDocuments({ company: req.user.id });
    const activeJobs = await Job.countDocuments({ company: req.user.id, status: 'active' });
    
    const applications = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobDetails'
        }
      },
      {
        $match: {
          'jobDetails.company': req.user.id
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalApplications = applications.reduce((sum, app) => sum + app.count, 0);

    res.json({
      totalJobs,
      activeJobs,
      totalApplications,
      applicationsByStatus: applications
    });
  } catch (error) {
    console.error('Get recruiter stats error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;