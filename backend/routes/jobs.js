import express from 'express';
import path from 'path';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import auth from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Sanitize filename to prevent path traversal
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${sanitizedName}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow PDF files for resumes
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for resumes'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Get all jobs with search and filters (PUBLIC - no auth required)
router.get('/', async (req, res) => {
  try {
    const { search, location, jobType, page = 1, limit = 10 } = req.query;
    
    let query = { status: 'active', isApproved: true };
    console.log('Public Jobs API - Query:', query);
    console.log('Public Jobs API - No auth required');
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (jobType) {
      query.jobType = jobType;
    }
    
    const jobs = await Job.find(query)
      .populate('company', 'name')
      .populate('postedBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    console.log('Public Jobs API - Final query:', query);
    console.log('Public Jobs API - Jobs found:', jobs.length);
    jobs.forEach(job => {
      console.log(`Public Job: ${job.title} | Status: ${job.status} | Approved: ${job.isApproved}`);
    });
    
    const total = await Job.countDocuments(query);
    
    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ msg: 'Server error while fetching jobs' });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('company', 'name email');
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get jobs by company (company users only)
router.get('/my-jobs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'company' && req.user.role !== 'recruiter') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const jobs = await Job.find({ 
      $or: [
        { company: req.user.id },
        { postedBy: req.user.id }
      ]
    })
    .populate('company', 'name')
    .sort({ createdAt: -1 });
    
    res.json({ jobs });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update job (admin and job owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    
    // Check permissions
    if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const { title, description, location, ctc, eligibilityCriteria, applicationDeadline, jobType } = req.body;
    
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      {
        title: title?.trim(),
        description: description?.trim(),
        location: location?.trim(),
        ctc,
        eligibilityCriteria,
        applicationDeadline,
        jobType
      },
      { new: true }
    );
    
    res.json({ msg: 'Job updated successfully', job: updatedJob });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ msg: 'Server error while updating job' });
  }
});

// Create job (companies and admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'company' && req.user.role !== 'admin' && req.user.role !== 'recruiter') {
      return res.status(403).json({ msg: 'Only companies, recruiters and admin can post jobs' });
    }
    
    console.log('User role posting job:', req.user.role);
    
    console.log('User posting job:', req.user.role, req.user.id);
    
    const { title, description, location, ctc, eligibilityCriteria, applicationDeadline, jobType } = req.body;
    
    // Input validation
    if (!title || !description || !location) {
      return res.status(400).json({ msg: 'Title, description and location are required' });
    }
    
    const job = new Job({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      ctc,
      eligibilityCriteria,
      applicationDeadline,
      jobType: jobType || 'Full-time',
      company: req.user.role === 'admin' ? null : req.user.id,
      postedBy: req.user.id,
      status: 'active',
      isApproved: true,
      status: 'active'
    });
    
    await job.save();
    await job.populate('company', 'name');
    console.log('Job created:', job);
    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ msg: 'Server error while creating job' });
  }
});

// Apply to job (students only)
router.post('/:jobId/apply', auth, upload.single('resume'), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can apply to jobs' });
    }
    
    const jobId = req.params.jobId;
    
    // Validate job exists
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    
    // Check if already applied
    const existingApplication = await Application.findOne({
      student: req.user.id,
      job: jobId
    });
    
    if (existingApplication) {
      return res.status(400).json({ msg: 'You have already applied to this job' });
    }
    
    // Validate resume upload
    if (!req.file) {
      return res.status(400).json({ msg: 'Resume file is required' });
    }
    
    const resumePath = `/uploads/${req.file.filename}`;
    
    const application = new Application({
      student: req.user.id,
      job: jobId,
      resume: resumePath,
      coverLetter: req.body.coverLetter || ''
    });
    
    await application.save();
    await application.populate(['student', 'job']);
    
    res.status(201).json({
      msg: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Apply job error:', error);
    if (error.message.includes('PDF')) {
      return res.status(400).json({ msg: error.message });
    }
    res.status(500).json({ msg: 'Server error while applying to job' });
  }
});

// Get job applications (company owners only)
router.get('/:jobId/applications', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    
    // Only job owner can see applications
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const applications = await Application.find({ job: req.params.jobId })
      .populate('student', 'name email college branch year')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;