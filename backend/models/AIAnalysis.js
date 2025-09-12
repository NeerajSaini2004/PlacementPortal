import mongoose from 'mongoose';

const aiAnalysisSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeFile: String,
  
  // Extracted data from resume
  extractedData: {
    skills: [String],
    education: [{
      degree: String,
      institution: String,
      year: String,
      grade: String
    }],
    experience: [{
      company: String,
      role: String,
      duration: String,
      description: String
    }],
    projects: [{
      name: String,
      description: String,
      technologies: [String]
    }],
    certifications: [String],
    languages: [String]
  },
  
  // AI feedback and suggestions
  feedback: {
    overallScore: { type: Number, min: 0, max: 100 },
    strengths: [String],
    improvements: [String],
    missingSkills: [String],
    recommendations: [String]
  },
  
  // Job matching scores
  jobMatches: [{
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    matchScore: { type: Number, min: 0, max: 100 },
    matchingSkills: [String],
    missingSkills: [String],
    reasoning: String
  }],
  
  analysisDate: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('AIAnalysis', aiAnalysisSchema);