import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AIResumeAnalyzer from '../components/AIResumeAnalyzer';
import axios from 'axios';
import FileUpload from '../components/FileUpload';

const StudentProfile = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    studentProfile: {
      rollNumber: '',
      college: '',
      branch: 'CSE',
      year: '3rd',
      cgpa: '',
      skills: [],
      phone: '',
      address: '',
      dateOfBirth: '',
      gender: 'Male'
    },
    linkedin: '',
    github: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        studentProfile: {
          rollNumber: user.studentProfile?.rollNumber || '',
          college: user.studentProfile?.college || '',
          branch: user.studentProfile?.branch || 'CSE',
          year: user.studentProfile?.year || '3rd',
          cgpa: user.studentProfile?.cgpa || '',
          skills: user.studentProfile?.skills || [],
          phone: user.studentProfile?.phone || '',
          address: user.studentProfile?.address || '',
          dateOfBirth: user.studentProfile?.dateOfBirth || '',
          gender: user.studentProfile?.gender || 'Male'
        },
        linkedin: user.linkedin || '',
        github: user.github || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('studentProfile.')) {
      const field = name.split('.')[1];
      setProfile(prev => ({
        ...prev,
        studentProfile: {
          ...prev.studentProfile,
          [field]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addSkill = () => {
    const sanitizedSkill = newSkill.trim().replace(/[<>"'&]/g, '');
    if (sanitizedSkill && !profile.studentProfile.skills.includes(sanitizedSkill)) {
      setProfile(prev => ({
        ...prev,
        studentProfile: {
          ...prev.studentProfile,
          skills: [...prev.studentProfile.skills, sanitizedSkill]
        }
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      studentProfile: {
        ...prev.studentProfile,
        skills: prev.studentProfile.skills.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Check if profile is complete
    const isComplete = profile.name && 
                      profile.studentProfile.rollNumber && 
                      profile.studentProfile.branch && 
                      profile.studentProfile.year && 
                      profile.studentProfile.cgpa && 
                      profile.studentProfile.phone;

    const updatedProfile = {
      ...profile,
      studentProfile: {
        ...profile.studentProfile,
        college: 'MBM University',
        isProfileComplete: isComplete
      }
    };

    try {
      const token = localStorage.getItem('token');
      await axios.put('https://placementportal-backend-k631.onrender.com/api/students/profile', updatedProfile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh user data in AuthContext
      await refreshUser();
      
      setMessage('✅ Profile updated successfully!');
      
      if (isComplete) {
        setMessage('✅ Profile completed! You can now apply for companies.');
      }
    } catch (error) {
      setMessage('❌ Failed to update profile: ' + (error.response?.data?.msg || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage('❌ Please upload only PDF files');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ File size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/students/upload-resume', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setMessage('✅ Resume uploaded successfully!');
      
      // Update profile with resume path
      setProfile(prev => ({
        ...prev,
        studentProfile: {
          ...prev.studentProfile,
          resume: res.data.resumePath
        }
      }));
    } catch (error) {
      setMessage('❌ Failed to upload resume: ' + (error.response?.data?.msg || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Profile</h1>
          
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roll Number
                </label>
                <input
                  type="text"
                  name="studentProfile.rollNumber"
                  value={profile.studentProfile.rollNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  College
                </label>
                <input
                  type="text"
                  name="studentProfile.college"
                  value="MBM University"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch
                </label>
                <select
                  name="studentProfile.branch"
                  value={profile.studentProfile.branch}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CSE">Computer Science Engineering</option>
                  <option value="IT">Information Technology</option>
                  <option value="ECE">Electronics & Communication</option>
                  <option value="EEE">Electrical & Electronics</option>
                  <option value="MECH">Mechanical Engineering</option>
                  <option value="CIVIL">Civil Engineering</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <select
                  name="studentProfile.year"
                  value={profile.studentProfile.year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="studentProfile.cgpa"
                  value={profile.studentProfile.cgpa}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="studentProfile.phone"
                  value={profile.studentProfile.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="studentProfile.gender"
                  value={profile.studentProfile.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.studentProfile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume Upload
              </label>
              <FileUpload 
                onUploadSuccess={(data) => {
                  setMessage('✅ Resume uploaded successfully!');
                  setProfile(prev => ({
                    ...prev,
                    studentProfile: {
                      ...prev.studentProfile,
                      resume: data.resumePath
                    }
                  }));
                }}
              />
              {profile.studentProfile.resume && (
                <div className="mt-2 p-2 bg-green-50 rounded border">
                  <p className="text-sm text-green-700">✅ Resume uploaded</p>
                  <a 
                    href={`http://localhost:5000${profile.studentProfile.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Resume
                  </a>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={profile.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  name="github"
                  value={profile.github}
                  onChange={handleInputChange}
                  placeholder="https://github.com/yourusername"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-md text-white font-medium ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
        
        {/* AI Resume Analyzer */}
        <div className="mt-8">
          <AIResumeAnalyzer onAnalysisComplete={(analysis) => {
            console.log('Resume analysis completed:', analysis);
            // You can update profile with extracted data here
          }} />
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
