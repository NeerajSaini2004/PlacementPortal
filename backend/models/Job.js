import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Job Details
  location: String,
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Contract'], default: 'Full-time' },
  workMode: { type: String, enum: ['Remote', 'On-site', 'Hybrid'], default: 'On-site' },
  
  // Salary/CTC Details
  ctc: {
    base: { type: Number, required: true },
    variable: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'INR' }
  },
  
  // Eligibility Criteria
  eligibilityCriteria: {
    minCGPA: { type: Number, min: 0, max: 10 },
    allowedBranches: [{ type: String, enum: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'OTHER', 'ALL'] }],
    graduationYear: [String],
    maxBacklogs: { type: Number, default: 0 },
    requiredSkills: [String]
  },
  
  // Job Requirements
  requirements: {
    experience: String,
    education: String,
    skills: [String]
  },
  
  // Job Details
  responsibilities: [String],
  benefits: [String],
  category: String,
  
  // Application Settings
  applicationDeadline: { type: Date, required: true },
  maxApplications: { type: Number, default: 100 },
  applicationCount: { type: Number, default: 0 },
  
  // Status
  status: { type: String, enum: ['draft', 'active', 'closed', 'cancelled'], default: 'active' },
  isApproved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  
  // Additional Info
  jobDescription: String, // Detailed JD
  selectionProcess: [String], // Interview rounds
  contactEmail: String,
  
  // SEO & Search
  tags: [String],
  slug: String
}, { timestamps: true });

// Indexes
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ status: 1 });
jobSchema.index({ isApproved: 1 });
jobSchema.index({ 'eligibilityCriteria.allowedBranches': 1 });
jobSchema.index({ applicationDeadline: 1 });

export default mongoose.model('Job', jobSchema);