import express from 'express';
import Company from '../models/Company.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all companies (public)
router.get('/', async (req, res) => {
  try {
    const { branch, status = 'active' } = req.query;
    
    let filter = { status };
    if (branch && branch !== 'ALL') {
      filter['eligibility.allowedBranches'] = { $in: [branch, 'ALL'] };
    }
    
    const companies = await Company.find(filter)
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(companies);
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Add new company (TPO/Admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    
    const company = new Company({
      ...req.body,
      addedBy: req.user.id
    });
    
    await company.save();
    await company.populate('addedBy', 'name');
    
    res.status(201).json(company);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ msg: 'Company already exists' });
    }
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Apply to company (Students only)
router.post('/apply', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can apply' });
    }

    const { companyId } = req.body;
    const company = await Company.findById(companyId);
    
    if (!company) {
      return res.status(404).json({ msg: 'Company not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      student: req.user.id,
      job: companyId
    });

    if (existingApplication) {
      return res.status(400).json({ msg: 'Already applied to this company' });
    }

    const application = new Application({
      student: req.user.id,
      job: companyId,
      appliedAt: new Date()
    });

    await application.save();
    res.json({ msg: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get company applicants (TPO/Admin only)
router.get('/:id/applicants', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    
    const applications = await Application.find({ job: req.params.id })
      .populate('student', 'name email studentProfile')
      .sort({ appliedAt: -1 });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

export default router;