import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Application Details
  coverLetter: String,
  resume: String,
  portfolio: String,
  
  // Status Tracking
  status: { 
    type: String, 
    enum: ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'interviewed', 'selected', 'rejected', 'withdrawn'], 
    default: 'applied' 
  },
  
  // Interview Details
  interview: {
    isScheduled: { type: Boolean, default: false },
    date: Date,
    time: String,
    mode: { type: String, enum: ['online', 'offline'] },
    meetingLink: String,
    location: String,
    interviewerName: String,
    interviewerEmail: String,
    feedback: String,
    score: { type: Number, min: 0, max: 100 }
  },
  
  // Recruiter Actions
  recruiterNotes: String,
  shortlistedAt: Date,
  shortlistedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: String,
  
  // Selection Details
  selectedAt: Date,
  offerDetails: {
    ctc: Number,
    joiningDate: Date,
    location: String,
    designation: String
  },
  
  // Tracking
  appliedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  lastUpdated: { type: Date, default: Date.now },
  
  // Status History
  statusHistory: [{
    status: String,
    date: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String
  }],
  
  // Resume Screening (AI/NLP)
  resumeScore: {
    overallScore: { type: Number, min: 0, max: 100 },
    skillsMatch: { type: Number, min: 0, max: 100 },
    experienceMatch: { type: Number, min: 0, max: 100 },
    educationMatch: { type: Number, min: 0, max: 100 },
    extractedSkills: [String],
    recommendations: [String]
  }
}, { timestamps: true });

// Indexes
applicationSchema.index({ job: 1, student: 1 }, { unique: true });
applicationSchema.index({ status: 1 });
applicationSchema.index({ appliedAt: -1 });
applicationSchema.index({ student: 1 });
applicationSchema.index({ job: 1 });

export default mongoose.model('Application', applicationSchema);