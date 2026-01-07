import React, { useState } from 'react';
import axios from 'axios';

const JobPosting = () => {
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'Full-time',
    workMode: 'On-site',
    ctc: {
      base: '',
      variable: '',
      total: ''
    },
    eligibilityCriteria: {
      minCGPA: '',
      allowedBranches: [],
      graduationYear: [],
      maxBacklogs: 0,
      requiredSkills: []
    },
    requirements: {
      experience: '',
      education: '',
      skills: []
    },
    responsibilities: [],
    benefits: [],
    applicationDeadline: '',
    maxApplications: 100,
    jobDescription: '',
    selectionProcess: [],
    contactEmail: ''
  });

  const [newItem, setNewItem] = useState({
    responsibility: '',
    benefit: '',
    skill: '',
    selectionStep: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const branches = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'ALL'];
  const years = ['2024', '2025', '2026', '2027'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('ctc.')) {
      const field = name.split('.')[1];
      setJobData(prev => ({
        ...prev,
        ctc: {
          ...prev.ctc,
          [field]: value,
          total: field === 'base' || field === 'variable' 
            ? (parseFloat(prev.ctc.base || 0) + parseFloat(prev.ctc.variable || 0) + parseFloat(value || 0)).toString()
            : prev.ctc.total
        }
      }));
    } else if (name.startsWith('eligibilityCriteria.')) {
      const field = name.split('.')[1];
      setJobData(prev => ({
        ...prev,
        eligibilityCriteria: {
          ...prev.eligibilityCriteria,
          [field]: value
        }
      }));
    } else if (name.startsWith('requirements.')) {
      const field = name.split('.')[1];
      setJobData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          [field]: value
        }
      }));
    } else {
      setJobData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (field, value) => {
    setJobData(prev => ({
      ...prev,
      eligibilityCriteria: {
        ...prev.eligibilityCriteria,
        [field]: prev.eligibilityCriteria[field].includes(value)
          ? prev.eligibilityCriteria[field].filter(item => item !== value)
          : [...prev.eligibilityCriteria[field], value]
      }
    }));
  };

  const addArrayItem = (field, itemKey) => {
    if (newItem[itemKey].trim()) {
      setJobData(prev => ({
        ...prev,
        [field]: [...prev[field], newItem[itemKey].trim()]
      }));
      setNewItem(prev => ({ ...prev, [itemKey]: '' }));
    }
  };

  const removeArrayItem = (field, index) => {
    setJobData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Calculate total CTC
      const totalCTC = parseFloat(jobData.ctc.base || 0) + parseFloat(jobData.ctc.variable || 0);
      const finalJobData = {
        ...jobData,
        ctc: {
          ...jobData.ctc,
          base: parseFloat(jobData.ctc.base),
          variable: parseFloat(jobData.ctc.variable || 0),
          total: totalCTC
        },
        eligibilityCriteria: {
          ...jobData.eligibilityCriteria,
          minCGPA: parseFloat(jobData.eligibilityCriteria.minCGPA || 0)
        }
      };

      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/jobs', finalJobData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('✅ Job posted successfully!');
      
      // Reset form
      setJobData({
        title: '',
        description: '',
        location: '',
        jobType: 'Full-time',
        workMode: 'On-site',
        ctc: { base: '', variable: '', total: '' },
        eligibilityCriteria: {
          minCGPA: '',
          allowedBranches: [],
          graduationYear: [],
          maxBacklogs: 0,
          requiredSkills: []
        },
        requirements: { experience: '', education: '', skills: [] },
        responsibilities: [],
        benefits: [],
        applicationDeadline: '',
        maxApplications: 100,
        jobDescription: '',
        selectionProcess: [],
        contactEmail: ''
      });
    } catch (error) {
      setMessage('❌ Failed to post job: ' + (error.response?.data?.msg || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New Job</h1>
          
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Job Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={jobData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={jobData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  name="jobType"
                  value={jobData.jobType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Mode
                </label>
                <select
                  name="workMode"
                  value={jobData.workMode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                name="description"
                value={jobData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* CTC Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">CTC Details (in LPA)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Salary *
                  </label>
                  <input
                    type="number"
                    name="ctc.base"
                    value={jobData.ctc.base}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variable Pay
                  </label>
                  <input
                    type="number"
                    name="ctc.variable"
                    value={jobData.ctc.variable}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total CTC
                  </label>
                  <input
                    type="number"
                    value={(parseFloat(jobData.ctc.base || 0) + parseFloat(jobData.ctc.variable || 0)).toFixed(2)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Eligibility Criteria</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum CGPA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    name="eligibilityCriteria.minCGPA"
                    value={jobData.eligibilityCriteria.minCGPA}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Backlogs
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="eligibilityCriteria.maxBacklogs"
                    value={jobData.eligibilityCriteria.maxBacklogs}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Branches
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {branches.map(branch => (
                    <label key={branch} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={jobData.eligibilityCriteria.allowedBranches.includes(branch)}
                        onChange={() => handleCheckboxChange('allowedBranches', branch)}
                        className="mr-2"
                      />
                      {branch}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Graduation Year
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {years.map(year => (
                    <label key={year} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={jobData.eligibilityCriteria.graduationYear.includes(year)}
                        onChange={() => handleCheckboxChange('graduationYear', year)}
                        className="mr-2"
                      />
                      {year}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline *
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={jobData.applicationDeadline}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Applications
                </label>
                <input
                  type="number"
                  min="1"
                  name="maxApplications"
                  value={jobData.maxApplications}
                  onChange={handleInputChange}
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
                {loading ? 'Posting Job...' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobPosting;