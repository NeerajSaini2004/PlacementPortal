import express from 'express';
import multer from 'multer';
import path from 'path';
import AIService from '../services/aiService.js';
import AIAnalysis from '../models/AIAnalysis.js';
import ChatHistory from '../models/ChatHistory.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// File upload for resume analysis
const storage = multer.diskStorage({
  destination: 'uploads/resumes/',
  filename: (req, file, cb) => {
    cb(null, `ai-${req.user.id}-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files allowed'), false);
    }
  }
});

// AI Resume Analyzer
router.post('/analyze-resume', auth, upload.single('resume'), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can analyze resumes' });
    }

    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a resume file' });
    }

    // Extract text from file
    const resumeText = await AIService.extractTextFromFile(req.file.path, req.file.mimetype);
    if (!resumeText) {
      return res.status(400).json({ msg: 'Could not extract text from file' });
    }

    // Analyze resume with AI
    const analysis = await AIService.analyzeResume(resumeText);
    if (!analysis) {
      return res.status(500).json({ msg: 'Resume analysis failed' });
    }

    // Save analysis to database
    const aiAnalysis = new AIAnalysis({
      student: req.user.id,
      resumeFile: req.file.path,
      extractedData: analysis.extractedData,
      feedback: analysis.feedback
    });

    await aiAnalysis.save();

    // Update student profile with extracted skills
    await User.findByIdAndUpdate(req.user.id, {
      'studentProfile.skills': analysis.extractedData.skills,
      'studentProfile.resume': req.file.path
    });

    res.json({
      msg: 'Resume analyzed successfully',
      analysis: {
        extractedData: analysis.extractedData,
        feedback: analysis.feedback
      }
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ msg: 'Server error during resume analysis' });
  }
});

// AI Job Recommendations
router.get(['/recommendations', '/recommendations/:studentId'], auth, async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user.id;

    const student = await User.findById(studentId);
    if (!student || !student.studentProfile) {
      return res.status(404).json({ msg: 'Student profile not found' });
    }

    const [jobs, companies] = await Promise.all([
      Job.find({ status: 'active', isApproved: true }),
      Company.find({ status: 'active' })
    ]);

    const allOpportunities = [...jobs, ...companies];

    const recommendations = await AIService.generateJobRecommendations(
      student.studentProfile,
      allOpportunities
    );

    res.json({
      studentName: student.name,
      recommendations: recommendations.map(rec => ({
        ...rec,
        opportunity: allOpportunities.find(
          opp => opp._id.toString() === rec.jobId.toString()
        )
      }))
    });
  } catch (error) {
    console.error('Job recommendations error:', error);
    res.status(500).json({ msg: 'Server error generating recommendations' });
  }
});


// AI Shortlisting Assistant
router.post('/shortlist-students', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'recruiter') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const { jobId, criteria } = req.body;

    // Get students who applied for this job
    const applications = await Application.find({ job: jobId })
      .populate('student');
    
    const students = applications.map(app => app.student);

    // Rank students using AI
    const rankedStudents = await AIService.rankStudentsForJob(students, criteria);

    res.json({
      jobId,
      totalApplicants: students.length,
      rankedStudents: rankedStudents.slice(0, 10) // Top 10
    });
  } catch (error) {
    console.error('Student shortlisting error:', error);
    res.status(500).json({ msg: 'Server error during shortlisting' });
  }
});

// AI Chatbot
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ msg: 'Message is required' });
    }

    // Get user context
    const user = await User.findById(req.user.id);
    
    // Generate AI response
    const response = await AIService.generateChatResponse(message, {
      role: user.role,
      profile: user.studentProfile || user.recruiterProfile
    });

    // Save chat history
    let chatHistory = await ChatHistory.findOne({ 
      user: req.user.id, 
      sessionId: sessionId || 'default',
      isActive: true 
    });

    if (!chatHistory) {
      chatHistory = new ChatHistory({
        user: req.user.id,
        sessionId: sessionId || 'default',
        messages: []
      });
    }

    chatHistory.messages.push(
      { role: 'user', content: message },
      { role: 'assistant', content: response }
    );

    await chatHistory.save();

    res.json({
      response,
      sessionId: chatHistory.sessionId
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ msg: 'Server error in chatbot' });
  }
});

// Get chat history
router.get('/chat-history/:sessionId', auth, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    
    const chatHistory = await ChatHistory.findOne({
      user: req.user.id,
      sessionId,
      isActive: true
    });

    res.json({
      messages: chatHistory?.messages || [],
      sessionId
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ msg: 'Server error fetching chat history' });
  }
});

// Get chat history without sessionId
router.get('/chat-history', auth, async (req, res) => {
  try {
    const sessionId = 'default';
    
    const chatHistory = await ChatHistory.findOne({
      user: req.user.id,
      sessionId,
      isActive: true
    });

    res.json({
      messages: chatHistory?.messages || [],
      sessionId
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ msg: 'Server error fetching chat history' });
  }
});

// Get AI analysis for student
router.get('/analysis', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can view analysis' });
    }

    const analysis = await AIAnalysis.findOne({ student: req.user.id })
      .sort({ createdAt: -1 });

    if (!analysis) {
      return res.status(404).json({ msg: 'No analysis found. Please upload your resume first.' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ msg: 'Server error fetching analysis' });
  }
});

export default router;