import express from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Apply to a company (students only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can apply' });
    }
    
    const { job: companyId } = req.body;
    
    // Get student profile
    const student = await User.findById(req.user.id);
    if (!student || !student.studentProfile?.isProfileComplete) {
      return res.status(400).json({ msg: 'Please complete your profile before applying' });
    }
    
    // Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ msg: 'Company not found' });
    }
    
    // Check eligibility
    const { branch, cgpa } = student.studentProfile;
    
    // Check branch eligibility
    if (company.eligibility?.allowedBranches?.length && 
        !company.eligibility.allowedBranches.includes('ALL') &&
        !company.eligibility.allowedBranches.includes(branch)) {
      return res.status(400).json({ msg: `This position is not open for ${branch} branch students` });
    }
    
    // Check CGPA eligibility
    if (company.eligibility?.minCGPA && cgpa < company.eligibility.minCGPA) {
      return res.status(400).json({ 
        msg: `Minimum CGPA required: ${company.eligibility.minCGPA}. Your CGPA: ${cgpa}` 
      });
    }
    
    // Check deadline
    if (new Date() > new Date(company.applicationDeadline)) {
      return res.status(400).json({ msg: 'Application deadline has passed' });
    }
    
    // Check if already applied
    const existingApplication = await Application.findOne({
      student: req.user.id,
      job: companyId
    });
    
    if (existingApplication) {
      return res.status(400).json({ msg: 'Already applied to this company' });
    }
    
    // Create application
    const application = new Application({
      student: req.user.id,
      job: companyId,
      status: 'applied'
    });
    
    await application.save();
    
    // Update company application count
    await Company.findByIdAndUpdate(companyId, {
      $inc: { totalApplications: 1 }
    });
    
    res.status(201).json({ msg: 'Application submitted successfully', application });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ msg: 'Server error while applying' });
  }
});

// Get my applications (students)
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const applications = await Application.find({ student: req.user.id })
      .populate('job')
      .sort({ appliedAt: -1 });
    
    res.json(applications);
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get applications for logged in user
router.get('/', auth, async (req, res) => {
  try {
    let applications = [];
    
    if (req.user.role === 'admin') {
      // Admins see all applications
      applications = await Application.find({})
        .populate('student', 'name email studentProfile')
        .populate('job')
        .sort({ appliedAt: -1 });
    } else {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ msg: 'Server error while fetching applications' });
  }
});

// Update application status (admins only)
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'interviewed', 'selected', 'rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }
    
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }
    
    // Check permissions - only admins can update
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    
    application.status = status;
    application.reviewedAt = new Date();
    
    // Add to status history
    application.statusHistory.push({
      status,
      date: new Date(),
      note: req.body.note || ''
    });
    
    await application.save();
    
    res.json({
      msg: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ msg: 'Server error while updating application status' });
  }
});

// Get single application details
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email college branch year phone')
      .populate('job', 'title description location salary')
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name email'
        }
      });
    
    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }
    
    // Check permissions
    const isStudent = req.user.role === 'student' && application.student._id.toString() === req.user.id;
    const isCompany = req.user.role === 'company' && application.job.company._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isStudent && !isCompany && !isAdmin) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;