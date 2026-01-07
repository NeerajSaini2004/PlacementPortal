import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/jobs/my-jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Company jobs:', res.data);
      setJobs(res.data.jobs || []);
    } catch (error) {
      console.error('Error fetching company jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Company Dashboard</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">My Posted Jobs</h2>
        
        {loading ? (
          <div className="text-center py-8">Loading jobs...</div>
        ) : jobs.length > 0 ? (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <p className="text-gray-600">{job.location}</p>
                    <p className="text-green-600 font-medium">₹{job.ctc?.total} LPA</p>
                    <p className="text-sm text-gray-500">
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {job.applicationCount || 0} applications
                    </p>
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
              Post Job
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;