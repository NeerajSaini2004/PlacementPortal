import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    unique: true
  },
  logo: String,
  description: String,
  website: String,
  industry: String,
  location: String,
  
  // Job Details
  jobRole: { 
    type: String, 
    required: true 
  },
  jobDescription: String,
  
  // Package Details
  package: {
    ctc: { type: Number, required: true },
    base: Number,
    variable: Number,
    currency: { type: String, default: 'INR' }
  },
  
  // Eligibility Criteria
  eligibility: {
    minCGPA: { type: Number, min: 0, max: 10 },
    allowedBranches: [{ 
      type: String, 
      enum: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'ALL'] 
    }],
    graduationYear: [String],
    maxBacklogs: { type: Number, default: 0 },
    requiredSkills: [String]
  },
  
  // Application Details
  applicationDeadline: { 
    type: Date, 
    required: true 
  },
  visitDate: Date,
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'closed', 'cancelled'], 
    default: 'active' 
  },
  
  // TPO Management
  addedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Statistics
  totalApplications: { type: Number, default: 0 },
  selectedStudents: { type: Number, default: 0 },
  
  // Selection Process
  selectionProcess: [String],
  
  // Contact Information
  hrContact: {
    name: String,
    email: String,
    phone: String
  }
}, { 
  timestamps: true 
});

// Indexes
companySchema.index({ name: 'text', jobRole: 'text' });
companySchema.index({ status: 1 });
companySchema.index({ applicationDeadline: 1 });
companySchema.index({ 'eligibility.allowedBranches': 1 });

export default mongoose.model('Company', companySchema);