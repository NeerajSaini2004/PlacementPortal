import React, { useState, useEffect } from 'react';
import { useJobs } from '../contexts/JobsContext';

const JobCard = ({ job }) => {
  const { applyToJob } = useJobs();
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');


  const handleApply = async () => {
    try {
      setApplying(true);
      setMessage('');
      const result = await applyToJob(job._id);
      if (result.success) {

        setMessage('✅ Applied successfully!');
      } else {
        setMessage('❌ ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Network error. Please try again.');
    } finally {
      setApplying(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
          <p className="text-gray-600 font-medium">{job.company?.name}</p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {job.jobType || 'Full-time'}
        </span>
      </div>
      
      <p className="text-gray-700 mb-4">{job.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm text-gray-500">📍 {job.location}</span>
        {job.salary && (
          <span className="text-sm text-gray-500">
            💰 ₹{job.salary.min?.toLocaleString()} - ₹{job.salary.max?.toLocaleString()}
          </span>
        )}
      </div>
      
      {message && (
        <div className={`text-sm p-2 rounded mb-3 ${
          message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Posted {new Date(job.createdAt || Date.now()).toLocaleDateString()}
        </div>
        <button 
          onClick={handleApply}
          disabled={applying}
          className={`px-4 py-2 rounded-lg transition-colors ${
            applying 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {applying ? 'Applying...' : 'Apply Now'}
        </button>
      </div>
    </div>
  );
};

export default function Jobs() {
  const { jobs, loading, fetchJobs, totalPages } = useJobs();
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
    sortBy: 'newest',
    page: 1
  });

  useEffect(() => {
    fetchJobs(filters);
  }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Your Dream Job
          </h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <input 
              type="text"
              placeholder="Search jobs, companies, skills..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select 
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Locations</option>
              <option value="Remote">Remote</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
            </select>
            <button 
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Job Results */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {jobs.length} jobs found
          </p>
          <select 
            className="border rounded-lg px-3 py-2"
            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
          >
            <option value="newest">Newest First</option>
            <option value="salary">Highest Salary</option>
            <option value="company">Company A-Z</option>
          </select>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search criteria
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}