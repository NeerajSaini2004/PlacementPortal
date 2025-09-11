import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: { 
    type: String, 
    enum: ['student', 'recruiter', 'admin'], 
    default: 'student' 
  },
  
  // Student specific fields
  studentProfile: {
    rollNumber: String,
    college: String,
    branch: { type: String, enum: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'OTHER'] },
    year: { type: String, enum: ['1st', '2nd', '3rd', '4th', 'Graduate'] },
    cgpa: { type: Number, min: 0, max: 10 },
    skills: [String],
    resume: String,
    portfolio: String,
    phone: String,
    address: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    isProfileComplete: { type: Boolean, default: false }
  },
  
  // Recruiter specific fields
  recruiterProfile: {
    companyName: { type: String, trim: true },
    companyDescription: { type: String, trim: true, maxlength: 1000 },
    website: String,
    industry: String,
    companySize: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'] },
    location: String,
    contactPerson: String,
    designation: String,
    companyLogo: String,
    isApproved: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    rejectionReason: String
  },
  
  // Profile fields
  avatar: String,
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  
  // Social links
  linkedin: String,
  github: String,
  
  // Preferences
  preferences: {
    jobAlerts: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true }
  },
  
  // Tracking
  lastLogin: Date,
  profileViews: { type: Number, default: 0 }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Indexes
// userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'recruiterProfile.isApproved': 1 });
userSchema.index({ 'studentProfile.branch': 1 });

export default mongoose.model('User', userSchema);