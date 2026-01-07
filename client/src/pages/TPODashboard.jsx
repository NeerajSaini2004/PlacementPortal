import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const TPODashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('companies');
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Company form state
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    jobRole: '',
    package: { ctc: '', base: '', variable: '' },
    eligibility: {
      minCGPA: '',
      allowedBranches: [],
      graduationYear: ['2024', '2025'],
      maxBacklogs: 0,
      requiredSkills: []
    },
    applicationDeadline: '',
    visitDate: '',
    description: '',
    selectionProcess: ['Resume Screening', 'Technical Interview', 'HR Interview']
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (activeTab === 'companies') {
        const res = await axios.get('http://localhost:5000/api/companies');
        setCompanies(res.data);
      } else if (activeTab === 'jobs') {
        const res = await axios.get('http://localhost:5000/api/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Jobs API response:', res.data);
        const jobsData = Array.isArray(res.data) ? res.data : res.data.jobs || [];
        console.log('Setting jobs:', jobsData);
        setJobs(jobsData);
      } else if (activeTab === 'students') {
        const res = await axios.get('http://localhost:5000/api/auth/students', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(res.data);
      } else if (activeTab === 'applications') {
        const res = await axios.get('http://localhost:5000/api/applications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/companies', companyForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowAddCompany(false);
      setCompanyForm({
        name: '',
        jobRole: '',
        package: { ctc: '', base: '', variable: '' },
        eligibility: {
          minCGPA: '',
          allowedBranches: [],
          graduationYear: ['2024', '2025'],
          maxBacklogs: 0,
          requiredSkills: []
        },
        applicationDeadline: '',
        visitDate: '',
        description: '',
        selectionProcess: ['Resume Screening', 'Technical Interview', 'HR Interview']
      });
      fetchData();
    } catch (error) {
      console.error('Error adding company:', error);
      alert('Error adding company');
    }
  };

  const handleApproveReject = async (applicationId, status, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/applications/${applicationId}`,
        { status, rejectionReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const CompanyForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Add New Company</h3>
        <form onSubmit={handleAddCompany} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Company Name"
              value={companyForm.name}
              onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
              className="border rounded-lg px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Job Role"
              value={companyForm.jobRole}
              onChange={(e) => setCompanyForm({...companyForm, jobRole: e.target.value})}
              className="border rounded-lg px-3 py-2"
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="CTC (LPA)"
              value={companyForm.package.ctc}
              onChange={(e) => setCompanyForm({
                ...companyForm, 
                package: {...companyForm.package, ctc: e.target.value}
              })}
              className="border rounded-lg px-3 py-2"
              required
            />
            <input
              type="number"
              placeholder="Base Salary"
              value={companyForm.package.base}
              onChange={(e) => setCompanyForm({
                ...companyForm, 
                package: {...companyForm.package, base: e.target.value}
              })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="number"
              placeholder="Variable Pay"
              value={companyForm.package.variable}
              onChange={(e) => setCompanyForm({
                ...companyForm, 
                package: {...companyForm.package, variable: e.target.value}
              })}
              className="border rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="0.1"
              placeholder="Min CGPA"
              value={companyForm.eligibility.minCGPA}
              onChange={(e) => setCompanyForm({
                ...companyForm, 
                eligibility: {...companyForm.eligibility, minCGPA: e.target.value}
              })}
              className="border rounded-lg px-3 py-2"
            />
            <select
              multiple
              value={companyForm.eligibility.allowedBranches}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setCompanyForm({
                  ...companyForm, 
                  eligibility: {...companyForm.eligibility, allowedBranches: values}
                });
              }}
              className="border rounded-lg px-3 py-2"
            >
              <option value="CSE">Computer Science</option>
              <option value="IT">Information Technology</option>
              <option value="ECE">Electronics & Communication</option>
              <option value="EEE">Electrical Engineering</option>
              <option value="MECH">Mechanical Engineering</option>
              <option value="CIVIL">Civil Engineering</option>
              <option value="ALL">All Branches</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              placeholder="Application Deadline"
              value={companyForm.applicationDeadline}
              onChange={(e) => setCompanyForm({...companyForm, applicationDeadline: e.target.value})}
              className="border rounded-lg px-3 py-2"
              required
            />
            <input
              type="date"
              placeholder="Visit Date"
              value={companyForm.visitDate}
              onChange={(e) => setCompanyForm({...companyForm, visitDate: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
          </div>

          <textarea
            placeholder="Job Description"
            value={companyForm.description}
            onChange={(e) => setCompanyForm({...companyForm, description: e.target.value})}
            className="border rounded-lg px-3 py-2 w-full h-24"
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddCompany(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">TPO Dashboard - MBM University</h1>
        <p className="text-gray-600">Manage placement activities and student applications</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {['companies', 'jobs', 'students', 'applications', 'statistics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md capitalize transition-colors ${
              activeTab === tab
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Companies Tab */}
      {activeTab === 'companies' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Visiting Companies</h2>
            <button
              onClick={() => setShowAddCompany(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Company
            </button>
          </div>
          
          <div className="grid gap-4">
            {companies.map((company) => (
              <div key={company._id} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{company.name}</h3>
                    <p className="text-gray-600">{company.jobRole}</p>
                    <p className="text-green-600 font-medium">₹{company.package.ctc} LPA</p>
                    <p className="text-sm text-gray-500">
                      Deadline: {new Date(company.applicationDeadline).toLocaleDateString()}
                    </p>
                    <div className="mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {company.eligibility.allowedBranches.join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {company.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {company.totalApplications} applications
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Posted Jobs</h2>
            <a
              href="/post-job"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Post New Job
            </a>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading jobs...</div>
          ) : jobs.length > 0 ? (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <div key={job._id} className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-gray-600">{job.company?.name || 'Direct Hire'}</p>
                      <p className="text-green-600 font-medium">₹{job.ctc?.total || 'N/A'} LPA</p>
                      <p className="text-sm text-gray-500">{job.location}</p>
                      <div className="mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {job.jobType}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                      <a
                        href={`/edit-job/${job._id}`}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                      >
                        Edit
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">No jobs posted yet</h3>
              <p className="text-gray-500 mb-4">Start by posting your first job opening</p>
              <a
                href="/post-job"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Post First Job
              </a>
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Registered Students</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Roll No</th>
                  <th className="px-4 py-3 text-left">Branch</th>
                  <th className="px-4 py-3 text-left">Year</th>
                  <th className="px-4 py-3 text-left">CGPA</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-t">
                    <td className="px-4 py-3">{student.name}</td>
                    <td className="px-4 py-3">{student.studentProfile?.rollNumber || 'N/A'}</td>
                    <td className="px-4 py-3">{student.studentProfile?.branch || 'N/A'}</td>
                    <td className="px-4 py-3">{student.studentProfile?.year || 'N/A'}</td>
                    <td className="px-4 py-3">{student.studentProfile?.cgpa || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        student.studentProfile?.isProfileComplete 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {student.studentProfile?.isProfileComplete ? 'Complete' : 'Incomplete'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Student Applications</h2>
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application._id} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{application.student?.name}</h3>
                    <p className="text-gray-600">{application.job?.title}</p>
                    <p className="text-sm text-gray-500">
                      Applied: {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {application.status === 'applied' && (
                      <>
                        <button
                          onClick={() => handleApproveReject(application._id, 'shortlisted')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Rejection reason:');
                            if (reason) handleApproveReject(application._id, 'rejected', reason);
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <span className={`px-2 py-1 rounded text-xs ${
                      application.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {application.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddCompany && <CompanyForm />}
    </div>
  );
};

export default TPODashboard;