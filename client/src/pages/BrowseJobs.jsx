import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const BrowseJobs = () => {
  console.log('=== BrowseJobs component START ===');
  console.log('Component rendering at:', new Date().toISOString());
  const { user, isAuthenticated } = useAuth();
  console.log('User:', user);
  console.log('IsAuthenticated:', isAuthenticated);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: 'all', branch: 'ALL', location: '', search: '' });
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    console.log('BrowseJobs component mounted');
    console.log('User state:', user);
    console.log('Auth state:', isAuthenticated);
    fetchJobs();
    fetchCompanies();
    if (isAuthenticated && user?.role === 'student') {
      fetchMyApplications();
    }
  }, []);

  const fetchJobs = async () => {
    try {
      console.log('BrowseJobs - Fetching from API...');
      const res = await axios.get('http://localhost:5000/api/jobs');
      console.log('BrowseJobs - API Response:', res.data);
      
      const jobsData = Array.isArray(res.data) ? res.data : (res.data.jobs || []);
      console.log('BrowseJobs - Jobs array:', jobsData);
      setJobs(jobsData);
    } catch (error) {
      console.error('BrowseJobs - Error:', error);
      setJobs([]);
    }
  };

  const fetchCompanies = async () => {
    try {
      console.log('Fetching companies from API...');
      const res = await axios.get('http://localhost:5000/api/companies');
      console.log('Companies fetched:', res.data);
      setCompanies(res.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      console.log('Setting empty companies array');
      setCompanies([]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/applications/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApply = async (jobId, jobType = 'job') => {
    console.log('Apply button clicked:', jobId, jobType);
    
    if (!isAuthenticated) {
      alert('Please login to apply for jobs!');
      return;
    }

    // Check profile completion
    const isComplete = user?.studentProfile?.rollNumber && 
                      user?.studentProfile?.branch && 
                      user?.studentProfile?.year && 
                      user?.studentProfile?.cgpa && 
                      user?.studentProfile?.phone;
    
    console.log('Profile complete check:', isComplete, user?.studentProfile);
    
    if (!isComplete) {
      alert('Please complete your profile before applying!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = 'http://localhost:5000/api/applications';
      const payload = { job: jobId };
      
      console.log('Sending application:', endpoint, payload);
      
      const response = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Application response:', response.data);
      alert('Application submitted successfully!');
      fetchMyApplications();
    } catch (error) {
      console.error('Apply error:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.msg || 'Error applying for this position');
    }
  };

  const isApplied = (jobId) => {
    return applications.some(app => app.job === jobId || app.job?._id === jobId);
  };

  const getApplicationStatus = (jobId) => {
    const app = applications.find(app => app.job === jobId || app.job?._id === jobId);
    return app?.status || null;
  };

  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter(job => {
    // Search filter (title, company, description)
    if (filter.search && filter.search.trim()) {
      const searchTerm = filter.search.toLowerCase().trim();
      const jobTitle = (job.title || '').toLowerCase();
      const companyName = (job.company?.name || '').toLowerCase();
      const jobDescription = (job.description || '').toLowerCase();
      
      if (!jobTitle.includes(searchTerm) && 
          !companyName.includes(searchTerm) && 
          !jobDescription.includes(searchTerm)) {
        return false;
      }
    }
    
    // Type filter
    if (filter.type !== 'all' && job.jobType !== filter.type) return false;
    
    // Branch filter
    if (filter.branch !== 'ALL') {
      const allowedBranches = job.eligibilityCriteria?.allowedBranches || ['ALL'];
      if (!allowedBranches.includes('ALL') && !allowedBranches.includes(filter.branch)) {
        return false;
      }
    }
    
    // Location filter
    if (filter.location && filter.location.trim()) {
      const jobLocation = job.location || '';
      if (!jobLocation.toLowerCase().includes(filter.location.toLowerCase().trim())) {
        return false;
      }
    }
    
    return true;
  });

  const filteredCompanies = (Array.isArray(companies) ? companies : []).filter(company => {
    // Search filter for companies
    if (filter.search && filter.search.trim()) {
      const searchTerm = filter.search.toLowerCase().trim();
      const companyName = (company.name || '').toLowerCase();
      const jobRole = (company.jobRole || '').toLowerCase();
      const description = (company.description || '').toLowerCase();
      
      if (!companyName.includes(searchTerm) && 
          !jobRole.includes(searchTerm) && 
          !description.includes(searchTerm)) {
        return false;
      }
    }
    
    if (filter.branch !== 'ALL' && !company.eligibility?.allowedBranches?.includes(filter.branch)) return false;
    return true;
  });

  console.log('BrowseJobs Render:', { 
    loading, 
    jobsCount: jobs.length, 
    companiesCount: companies.length,
    jobsArray: jobs,
    user: user?.name,
    isAuth: isAuthenticated 
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4">Loading opportunities...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Career Opportunities
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover your dream job with top companies visiting MBM University
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <div className="bg-white rounded-full px-6 py-2 shadow-md">
              <span className="text-blue-600 font-semibold">{jobs.length}</span>
              <span className="text-gray-600 ml-1">Active Jobs</span>
            </div>
            <div className="bg-white rounded-full px-6 py-2 shadow-md">
              <span className="text-blue-600 font-semibold">{companies.length}</span>
              <span className="text-gray-600 ml-1">Companies</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">🔍</span>
            Filter Opportunities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="🔍 Search jobs, companies..."
              value={filter.search}
              onChange={(e) => setFilter({...filter, search: e.target.value})}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50"
            />
            <select
            value={filter.type}
            onChange={(e) => setFilter({...filter, type: e.target.value})}
            className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50"
          >
            <option value="all">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
          </select>
          
          <select
            value={filter.branch}
            onChange={(e) => setFilter({...filter, branch: e.target.value})}
            className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50"
          >
            <option value="ALL">All Branches</option>
            <option value="CSE">Computer Science</option>
            <option value="IT">Information Technology</option>
            <option value="ECE">Electronics & Communication</option>
            <option value="EEE">Electrical Engineering</option>
            <option value="MECH">Mechanical Engineering</option>
            <option value="CIVIL">Civil Engineering</option>
          </select>

          <input
            type="text"
            placeholder="🌍 Search Location"
            value={filter.location}
            onChange={(e) => setFilter({...filter, location: e.target.value})}
            className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50"
          />

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-4 py-3 flex items-center justify-center font-semibold">
            <span className="text-lg mr-2">🎯</span>
            {filteredJobs.length + filteredCompanies.length} Opportunities
          </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div className="mb-12">
          <div className="flex items-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-3 mr-4">
              <span className="text-white text-2xl">💼</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Job Openings</h2>
              <p className="text-gray-600">Direct opportunities from top companies</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <div key={job._id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                  <p className="text-gray-600">{job.company?.name || 'Company'}</p>
                  <p className="text-sm text-gray-500">{job.location}</p>
                </div>
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md">
                  {job.jobType}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-semibold text-green-600">₹{job.ctc?.total} LPA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">{job.requirements?.experience || 'Fresher'}</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {job.description}
              </p>

              {isAuthenticated && user?.role === 'student' ? (
                <div>
                  {isApplied(job._id) ? (
                    <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      getApplicationStatus(job._id) === 'shortlisted' ? 'bg-green-100 text-green-800' :
                      getApplicationStatus(job._id) === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getApplicationStatus(job._id) || 'Applied'}
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('Button clicked for job:', job._id);
                        handleApply(job._id);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                      🚀 Apply Now
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm">
                  Login as student to apply
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Companies Section */}
      <div className="mt-12">
        <div className="flex items-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-3 mr-4">
            <span className="text-white text-2xl">🏢</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Company Visits</h2>
            <p className="text-gray-600">Campus recruitment drives</p>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading companies...</div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((company) => (
            <div key={company._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{company.name}</h3>
                  <p className="text-gray-600">{company.jobRole}</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Campus Visit
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-semibold text-green-600">₹{company.package.ctc} LPA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deadline:</span>
                  <span className="font-medium text-red-600">
                    {new Date(company.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {company.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {company.description}
                </p>
              )}

              {isAuthenticated && user?.role === 'student' ? (
                <div>
                  {isApplied(company._id) ? (
                    <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      getApplicationStatus(company._id) === 'shortlisted' ? 'bg-green-100 text-green-800' :
                      getApplicationStatus(company._id) === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getApplicationStatus(company._id) || 'Applied'}
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('Company button clicked for:', company._id);
                        handleApply(company._id, 'company');
                      }}
                      disabled={new Date() > new Date(company.applicationDeadline)}
                      className={`w-full py-2 px-4 rounded-lg font-medium ${
                        new Date() > new Date(company.applicationDeadline)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {new Date() > new Date(company.applicationDeadline) ? 'Deadline Passed' : 'Apply Now'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm">
                  Login as student to apply
                </div>
              )}
            </div>
          ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-blue-400 text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No companies found</h3>
            <p className="text-gray-500">Check back later for new company visits</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default BrowseJobs;