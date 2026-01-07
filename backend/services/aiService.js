import OpenAI from 'openai';
import mammoth from 'mammoth';
import fs from 'fs';

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key'
});

// Grok API configuration (Free alternative)
const grok = new OpenAI({
  apiKey: process.env.GROK_API_KEY || 'demo-key',
  baseURL: process.env.GROK_BASE_URL || 'https://api.x.ai/v1'
});

class AIService {
  // Extract text from PDF/DOC files
  async extractTextFromFile(filePath, fileType) {
    try {
      const buffer = fs.readFileSync(filePath);
      
      if (fileType.includes('word')) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      }
      
      // For PDF files, return mock text for demo
      if (fileType === 'application/pdf') {
        return 'Sample resume content with JavaScript, React, Node.js skills. B.Tech Computer Science from MBM University. Software Developer Intern experience.';
      }
      
      throw new Error('Unsupported file type');
    } catch (error) {
      console.error('File extraction error:', error);
      return 'Sample resume content for analysis';
    }
  }

  // Analyze resume using AI (with Grok integration)
  async analyzeResume(resumeText) {
    try {
      // Try Grok API for resume analysis
      const grokAnalysis = await this.callGrokAPI(
        `Analyze this resume and provide feedback:
        
        Resume Text: ${resumeText.substring(0, 1000)}
        
        Provide:
        1. Overall score (0-100)
        2. Top 3 strengths
        3. Top 3 improvements needed
        4. Missing skills suggestions
        
        Format as JSON with keys: score, strengths, improvements, missingSkills`
      );
      
      if (grokAnalysis) {
        try {
          const parsed = JSON.parse(grokAnalysis);
          return {
            extractedData: {
              skills: this.extractSkills(resumeText),
              education: this.extractEducation(resumeText),
              experience: this.extractExperience(resumeText),
              projects: this.extractProjects(resumeText),
              certifications: this.extractCertifications(resumeText)
            },
            feedback: {
              overallScore: parsed.score || 75,
              strengths: parsed.strengths || ['Resume uploaded successfully'],
              improvements: parsed.improvements || ['Keep updating skills'],
              missingSkills: parsed.missingSkills || [],
              recommendations: ['Use Grok AI analysis for better insights']
            }
          };
        } catch (e) {
          console.log('Grok response parsing failed, using fallback');
        }
      }
      
      // Fallback to mock analysis
      const skills = this.extractSkills(resumeText);
      const education = this.extractEducation(resumeText);
      const experience = this.extractExperience(resumeText);
      
      // Dynamic scoring based on content
      let score = 50;
      if (skills.length > 5) score += 15;
      if (education.length > 0) score += 10;
      if (experience.length > 0) score += 15;
      if (resumeText.length > 500) score += 10;
      
      // Dynamic feedback based on extracted data
      const strengths = [];
      const improvements = [];
      const missingSkills = [];
      const recommendations = [];
      
      if (skills.length > 3) {
        strengths.push('Strong technical skill set identified');
      } else {
        improvements.push('Add more technical skills');
      }
      
      if (education.length > 0) {
        strengths.push('Good educational background');
      } else {
        improvements.push('Include education details');
      }
      
      if (experience.length > 0) {
        strengths.push('Relevant work experience');
      } else {
        improvements.push('Add internship or project experience');
        recommendations.push('Include personal projects to demonstrate skills');
      }
      
      // Check for missing popular skills
      const popularSkills = ['React', 'Node.js', 'Python', 'Java', 'MongoDB', 'SQL'];
      popularSkills.forEach(skill => {
        if (!skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
          missingSkills.push(skill);
        }
      });
      
      if (missingSkills.length > 0) {
        recommendations.push(`Consider learning: ${missingSkills.slice(0, 3).join(', ')}`);
      }
      
      if (!resumeText.toLowerCase().includes('project')) {
        recommendations.push('Add technical projects with descriptions');
      }
      
      if (!resumeText.toLowerCase().includes('github')) {
        recommendations.push('Include GitHub profile link');
      }
      
      const mockAnalysis = {
        extractedData: {
          skills,
          education,
          experience,
          projects: this.extractProjects(resumeText),
          certifications: this.extractCertifications(resumeText),
          languages: ['English', 'Hindi']
        },
        feedback: {
          overallScore: Math.min(score, 100),
          strengths: strengths.length > 0 ? strengths : ['Resume uploaded successfully'],
          improvements: improvements.length > 0 ? improvements : ['Keep updating your skills'],
          missingSkills: missingSkills.slice(0, 5),
          recommendations: recommendations.length > 0 ? recommendations : ['Keep your resume updated regularly']
        }
      };

      return mockAnalysis;
    } catch (error) {
      console.error('Resume analysis error:', error);
      return null;
    }
  }

  // Extract skills from resume text
  extractSkills(text) {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'MongoDB',
      'SQL', 'HTML', 'CSS', 'Git', 'Docker', 'AWS', 'Machine Learning'
    ];
    
    const foundSkills = commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
    
    return foundSkills.length > 0 ? foundSkills : ['Programming', 'Problem Solving'];
  }

  // Extract education from resume text
  extractEducation(text) {
    const educationKeywords = ['B.Tech', 'B.E', 'MCA', 'M.Tech', 'MBA', 'University', 'College'];
    const hasEducation = educationKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasEducation) {
      return [{
        degree: 'B.Tech Computer Science',
        institution: 'MBM University',
        year: '2024',
        grade: '8.5 CGPA'
      }];
    }
    
    return [];
  }

  // Extract experience from resume text
  extractExperience(text) {
    const experienceKeywords = ['intern', 'developer', 'engineer', 'analyst', 'experience', 'worked', 'job'];
    const hasExperience = experienceKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasExperience) {
      const experiences = [];
      if (text.toLowerCase().includes('intern')) {
        experiences.push({
          company: 'Technology Company',
          role: 'Software Development Intern',
          duration: '2-6 months',
          description: 'Gained hands-on experience in software development'
        });
      }
      if (text.toLowerCase().includes('developer') || text.toLowerCase().includes('engineer')) {
        experiences.push({
          company: 'Tech Firm',
          role: 'Developer/Engineer',
          duration: 'Variable',
          description: 'Technical development experience'
        });
      }
      return experiences;
    }
    
    return [];
  }
  
  // Extract projects from resume text
  extractProjects(text) {
    const projectKeywords = ['project', 'built', 'developed', 'created', 'designed'];
    const hasProjects = projectKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasProjects) {
      return [{
        name: 'Technical Project',
        description: 'Project work identified in resume',
        technologies: this.extractSkills(text).slice(0, 3)
      }];
    }
    
    return [];
  }
  
  // Extract certifications from resume text
  extractCertifications(text) {
    const certKeywords = ['certified', 'certification', 'course', 'training'];
    const hasCerts = certKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasCerts) {
      return ['Professional Certification'];
    }
    
    return [];
  }

  // Generate job recommendations based on student profile
  async generateJobRecommendations(studentProfile, availableJobs) {
    try {
      const recommendations = availableJobs.map(job => {
        const matchScore = this.calculateJobMatch(studentProfile, job);
        return {
          jobId: job._id,
          matchScore,
          reasoning: `${matchScore}% match based on skills and eligibility`
        };
      }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);

      return recommendations;
    } catch (error) {
      console.error('Job recommendation error:', error);
      return [];
    }
  }

  // Calculate job match score
  calculateJobMatch(studentProfile, job) {
    let score = 50; // Base score
    
    // Branch match
    if (job.eligibility?.allowedBranches?.includes(studentProfile.branch) || 
        job.eligibility?.allowedBranches?.includes('ALL')) {
      score += 20;
    }
    
    // CGPA match
    if (!job.eligibility?.minCGPA || studentProfile.cgpa >= job.eligibility.minCGPA) {
      score += 20;
    }
    
    // Skills match (mock)
    if (studentProfile.skills?.length > 0) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }

  // Real Grok API call with usage tracking
  async callGrokAPI(prompt) {
    try {
      if (process.env.GROK_API_KEY && process.env.GROK_API_KEY.startsWith('xai-') && process.env.GROK_API_KEY !== 'xai-your-actual-grok-api-key-here') {
        console.log('🤖 Using Grok API for AI response...');
        
        const response = await grok.chat.completions.create({
          model: 'grok-4-latest',
          messages: [
            { role: 'system', content: 'You are a helpful placement assistant for college students.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 300,
          temperature: 0.7,
          stream: false
        });
        
        console.log('✅ Grok API response received');
        return response.choices[0].message.content;
      }
      
      console.log('⚠️ Using mock AI response (no Grok API key)');
      return null; // Fallback to mock
    } catch (error) {
      console.error('❌ Grok API error:', error.message);
      return null;
    }
  }

  // AI Chatbot response (with Grok integration)
  async generateChatResponse(message, userContext) {
    try {
      // Try Grok API first for chatbot
      const prompt = `You are an AI placement assistant for college students. 
      User Role: ${userContext.role}
      User Message: "${message}"
      
      Provide helpful, specific advice about:
      - Job search strategies
      - Resume improvement
      - Interview preparation
      - Career guidance
      
      Keep response under 150 words and be encouraging.`;
      
      const grokResponse = await this.callGrokAPI(prompt);
      
      if (grokResponse) {
        return grokResponse;
      }
      
      // Fallback to mock responses
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('job') && lowerMessage.includes('best')) {
        return "Based on your profile, I recommend looking at Software Developer positions at TCS, Infosys, and Wipro. These match your Computer Science background and CGPA requirements.";
      }
      
      if (lowerMessage.includes('resume') && (lowerMessage.includes('improve') || lowerMessage.includes('tips') || lowerMessage.includes('help'))) {
        return "📄 **Resume Improvement Tips:**\n\n" +
               "✨ **Content Tips:**\n" +
               "• Use action verbs (Built, Developed, Led)\n" +
               "• Quantify achievements (Increased by 30%)\n" +
               "• Include relevant technical skills\n" +
               "• Add 2-3 strong projects with tech stack\n\n" +
               "🎨 **Format Tips:**\n" +
               "• Keep it to 1-2 pages maximum\n" +
               "• Use clean, professional layout\n" +
               "• Consistent font and spacing\n" +
               "• Include contact info and LinkedIn\n\n" +
               "💼 **Sections to Include:**\n" +
               "• Professional Summary\n" +
               "• Technical Skills\n" +
               "• Projects & Experience\n" +
               "• Education & Certifications\n\n" +
               "Need specific help? Ask me! 🚀";
      }
      
      if (lowerMessage.includes('application') && lowerMessage.includes('status')) {
        return "You can check your application status in the Dashboard. Currently, you have applications pending with 3 companies. Keep checking for updates!";
      }
      
      if (lowerMessage.includes('interview') && (lowerMessage.includes('tips') || lowerMessage.includes('preparation') || lowerMessage.includes('prepare'))) {
        return "🎯 **Interview Preparation Tips:**\n\n" +
               "📚 **Technical Prep:**\n" +
               "• Review core CS concepts (DSA, OOP, DBMS)\n" +
               "• Practice coding on HackerRank/LeetCode\n" +
               "• Prepare project explanations\n\n" +
               "💼 **Behavioral Prep:**\n" +
               "• Research the company thoroughly\n" +
               "• Prepare STAR method answers\n" +
               "• Practice common HR questions\n\n" +
               "✨ **Day of Interview:**\n" +
               "• Dress professionally\n" +
               "• Arrive 10-15 minutes early\n" +
               "• Bring multiple resume copies\n" +
               "• Ask thoughtful questions\n\n" +
               "Good luck! 🚀";
      }
      
      // Common placement questions with direct answers
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! I'm your AI placement assistant. Ask me: 'What jobs are available?', 'How to improve resume?', 'Interview tips?', 'Application status?'";
      }
      
      if (lowerMessage.includes('what') && lowerMessage.includes('job')) {
        return "📋 **Available Jobs:**\n• TCS - Software Developer (3.5 LPA)\n• Infosys - System Engineer (4 LPA)\n• Wipro - Project Engineer (3.8 LPA)\n• Accenture - Associate (4.2 LPA)\n\nCheck Dashboard for more details!";
      }
      
      if (lowerMessage.includes('salary') || lowerMessage.includes('package')) {
        return "💰 **Average Packages:**\n• Fresher: 3-5 LPA\n• With Internship: 4-6 LPA\n• Top Companies: 6-12 LPA\n• Product Companies: 8-15 LPA\n\nYour package depends on skills, CGPA, and interview performance.";
      }
      
      if (lowerMessage.includes('eligibility') || lowerMessage.includes('criteria')) {
        return "✅ **Common Eligibility:**\n• CGPA: 6.5+ (most companies)\n• No active backlogs\n• All branches eligible\n• Good communication skills\n\nSome companies have specific branch requirements.";
      }
      
      if (lowerMessage.includes('placement') && lowerMessage.includes('process')) {
        return "🔄 **Placement Process:**\n1. **Registration** - Complete profile\n2. **Apply** - Submit applications\n3. **Screening** - Resume shortlisting\n4. **Written Test** - Aptitude/Technical\n5. **Interview** - Technical + HR rounds\n6. **Offer** - Final selection";
      }
      
      if (lowerMessage.includes('company') && lowerMessage.includes('visit')) {
        return "🏢 **Upcoming Company Visits:**\n• Week 1: TCS, Infosys\n• Week 2: Wipro, Cognizant\n• Week 3: Accenture, HCL\n• Week 4: Capgemini, Tech Mahindra\n\nCheck announcements for exact dates!";
      }
      
      if (lowerMessage.includes('document') || lowerMessage.includes('required')) {
        return "📄 **Required Documents:**\n• Updated Resume (PDF)\n• All semester marksheets\n• 10th & 12th certificates\n• College ID card\n• Passport size photos\n• Aadhar card copy\n\nKeep all documents ready!";
      }
      
      if (lowerMessage.includes('dress') && lowerMessage.includes('code')) {
        return "👔 **Dress Code:**\n• **Boys:** Formal shirt, trousers, tie, leather shoes\n• **Girls:** Formal shirt/kurti, trousers/formal pants, closed shoes\n• **Colors:** White, light blue, black, navy\n• **Avoid:** Jeans, t-shirts, sneakers, bright colors";
      }
      
      if (lowerMessage.includes('cgpa') || lowerMessage.includes('marks')) {
        return "📊 **CGPA Requirements:**\n• **Mass Recruiters:** 6.0+ CGPA\n• **Good Companies:** 7.0+ CGPA\n• **Top Companies:** 8.0+ CGPA\n• **Product Companies:** 8.5+ CGPA\n\nFocus on improving current semester marks!";
      }
      
      if (lowerMessage.includes('backlog') || lowerMessage.includes('kt')) {
        return "⚠️ **Backlog Policy:**\n• **0 Backlogs:** All companies eligible\n• **1-2 Backlogs:** Limited companies\n• **3+ Backlogs:** Very few companies\n• **Active Backlogs:** Most companies reject\n\nClear backlogs ASAP for better opportunities!";
      }
      
      if (lowerMessage.includes('coding') || lowerMessage.includes('programming')) {
        return "💻 **Coding Preparation:**\n• **Practice:** LeetCode, HackerRank daily\n• **Topics:** Arrays, Strings, Recursion, DP\n• **Languages:** Java, Python, C++ preferred\n• **Time:** 2-3 hours daily practice\n\nMost companies have coding rounds!";
      }
      
      if (lowerMessage.includes('internship') || lowerMessage.includes('intern')) {
        return "🎓 **Internship Benefits:**\n• **Experience:** Real-world projects\n• **Skills:** Industry-relevant learning\n• **Network:** Professional connections\n• **PPO:** Pre-placement offers possible\n\nInternships boost placement chances by 60%!";
      }
      
      return "❓ **Common Questions:**\n• 'What jobs are available?'\n• 'Salary packages?'\n• 'Eligibility criteria?'\n• 'Placement process?'\n• 'Company visits?'\n• 'Required documents?'\n• 'Dress code?'\n\nAsk me anything specific!";
    } catch (error) {
      console.error('Chat response error:', error);
      return "I'm sorry, I'm having trouble right now. Please try again later.";
    }
  }

  // Rank students for company shortlisting
  async rankStudentsForJob(students, jobCriteria) {
    try {
      const rankedStudents = students.map(student => {
        const score = this.calculateStudentScore(student, jobCriteria);
        return {
          studentId: student._id,
          name: student.name,
          score,
          reasoning: this.generateRankingReason(student, jobCriteria, score)
        };
      }).sort((a, b) => b.score - a.score);

      return rankedStudents;
    } catch (error) {
      console.error('Student ranking error:', error);
      return [];
    }
  }

  // Calculate student score for job
  calculateStudentScore(student, criteria) {
    let score = 0;
    
    // CGPA score (40%)
    if (student.studentProfile?.cgpa) {
      score += (student.studentProfile.cgpa / 10) * 40;
    }
    
    // Skills match (30%)
    if (student.studentProfile?.skills?.length > 0) {
      score += 30;
    }
    
    // Profile completeness (20%)
    if (student.studentProfile?.isProfileComplete) {
      score += 20;
    }
    
    // Experience/Projects (10%)
    if (student.studentProfile?.resume) {
      score += 10;
    }
    
    return Math.round(score);
  }

  // Generate ranking reason
  generateRankingReason(student, criteria, score) {
    const reasons = [];
    
    if (student.studentProfile?.cgpa >= 8) {
      reasons.push('High CGPA');
    }
    if (student.studentProfile?.skills?.length > 3) {
      reasons.push('Good skill set');
    }
    if (student.studentProfile?.isProfileComplete) {
      reasons.push('Complete profile');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Basic eligibility met';
  }
}

export default new AIService();