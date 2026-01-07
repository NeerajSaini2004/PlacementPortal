import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Companies = () => {
  const { user, isAuthenticated } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ branch: 'ALL', minCGPA: '' });
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchCompanies();
    if (isAuthenticated && user?.role === 'student') {
      fetchMyApplications();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    filterCompanies();
  }, [companies, filter, user]);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/companies');
      setCompanies(res.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
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

  const filterCompanies = () => {
    let filtered = companies.filter(company => company.status === 'active');
    
    // Apply eligibility filter for students
    if (user?.role === 'student' && user.studentProfile) {
      const { branch, cgpa } = user.studentProfile;
      
      filtered = filtered.filter(company => {
        // Check branch eligibility
        const branchEligible = !company.eligibility?.allowedBranches?.length ||
                              company.eligibility.allowedBranches.includes('ALL') || 
                              company.eligibility.allowedBranches.includes(branch);
        
        // Check CGPA eligibility
        const cgpaEligible = !company.eligibility?.minCGPA || 
                            (cgpa && cgpa >= company.eligibility.minCGPA);
        
        // Check deadline
        const deadlineValid = new Date() <= new Date(company.applicationDeadline);
        
        return branchEligible && cgpaEligible && deadlineValid;
      });
    }
    
    // Apply manual filter
    if (filter.branch !== 'ALL') {
      filtered = filtered.filter(company => 
        !company.eligibility?.allowedBranches?.length ||
        company.eligibility.allowedBranches.includes(filter.branch) ||
        company.eligibility.allowedBranches.includes('ALL')
      );
    }
    
    setFilteredCompanies(filtered);
  };

  const handleApply = async (companyId) => {
    if (!user?.studentProfile?.isProfileComplete) {
      alert('Please complete your profile before applying!');
      return;
    }
    
    // Check eligibility before applying
    const company = companies.find(c => c._id === companyId);
    if (company && user.studentProfile) {
      const { branch, cgpa } = user.studentProfile;
      
      // Check branch eligibility
      if (company.eligibility?.allowedBranches?.length && 
          !company.eligibility.allowedBranches.includes('ALL') &&
          !company.eligibility.allowedBranches.includes(branch)) {
        alert(`This position is not open for ${branch} branch students.`);
        return;
      }
      
      // Check CGPA eligibility
      if (company.eligibility?.minCGPA && cgpa < company.eligibility.minCGPA) {
        alert(`Minimum CGPA required: ${company.eligibility.minCGPA}. Your CGPA: ${cgpa}`);
        return;
      }
      
      // Check deadline
      if (new Date() > new Date(company.applicationDeadline)) {
        alert('Application deadline has passed!');
        return;
      }
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/applications`, 
        { job: companyId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Application submitted successfully!');
      fetchMyApplications();
    } catch (error) {
      alert(error.response?.data?.msg || 'Error applying to company');
    }
  };

  const isApplied = (companyId) => {
    return applications.some(app => app.job === companyId);
  };

  const getApplicationStatus = (companyId) => {
    const app = applications.find(app => app.job === companyId);
    return app?.status || null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mb-6">
            <span className="text-3xl text-white">🏢</span>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent mb-6">
            Company Visits
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover top companies visiting MBM University campus for recruitment drives
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">🔍</span>
            Filter Companies
          </h3>
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
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
          </div>
          
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-4 py-3 flex items-center justify-center font-semibold">
              <span className="text-lg mr-2">🏢</span>
              {filteredCompanies.length} Companies
            </div>
          </div>
        </div>

      {/* Companies Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.map((company) => (
          <div key={company._id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/20">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{company.name}</h3>
                <p className="text-gray-600">{company.jobRole}</p>
              </div>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Package:</span>
                <span className="font-semibold text-green-600">₹{company.package.ctc} LPA</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Min CGPA:</span>
                <span className="font-medium">{company.eligibility.minCGPA || 'No minimum'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Deadline:</span>
                <span className="font-medium text-red-600">
                  {new Date(company.applicationDeadline).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Eligible Branches:</p>
              <div className="flex flex-wrap gap-1">
                {company.eligibility.allowedBranches.map((branch) => (
                  <span key={branch} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {branch}
                  </span>
                ))}
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
                  <div className="text-center">
                    <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      getApplicationStatus(company._id) === 'shortlisted' ? 'bg-green-100 text-green-800' :
                      getApplicationStatus(company._id) === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getApplicationStatus(company._id) === 'applied' ? 'Application Submitted' :
                       getApplicationStatus(company._id) === 'shortlisted' ? 'Shortlisted' :
                       getApplicationStatus(company._id) === 'rejected' ? 'Rejected' :
                       getApplicationStatus(company._id)}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleApply(company._id)}
                    disabled={new Date() > new Date(company.applicationDeadline)}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
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

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">No companies found</h3>
          <p className="text-gray-500">Check back later for new opportunities</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default Companies;