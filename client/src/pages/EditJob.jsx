import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'Full-time',
    ctc: { total: '', base: '', variable: '' },
    eligibility: {
      minCGPA: '',
      allowedBranches: [],
      maxBacklogs: 0
    },
    requirements: {
      experience: '',
      skills: []
    }
  });

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobData(res.data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/jobs/${id}`, jobData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Job updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      alert('Error updating job');
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Edit Job</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Job Title"
            value={jobData.title}
            onChange={(e) => setJobData({...jobData, title: e.target.value})}
            className="border rounded-lg px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={jobData.location}
            onChange={(e) => setJobData({...jobData, location: e.target.value})}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <select
          value={jobData.jobType}
          onChange={(e) => setJobData({...jobData, jobType: e.target.value})}
          className="border rounded-lg px-3 py-2 w-full"
        >
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Internship">Internship</option>
        </select>

        <div className="grid grid-cols-3 gap-4">
          <input
            type="number"
            placeholder="Total CTC (LPA)"
            value={jobData.ctc?.total || ''}
            onChange={(e) => setJobData({
              ...jobData, 
              ctc: {...jobData.ctc, total: e.target.value}
            })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="number"
            placeholder="Base Salary"
            value={jobData.ctc?.base || ''}
            onChange={(e) => setJobData({
              ...jobData, 
              ctc: {...jobData.ctc, base: e.target.value}
            })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="number"
            placeholder="Variable Pay"
            value={jobData.ctc?.variable || ''}
            onChange={(e) => setJobData({
              ...jobData, 
              ctc: {...jobData.ctc, variable: e.target.value}
            })}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <textarea
          placeholder="Job Description"
          value={jobData.description}
          onChange={(e) => setJobData({...jobData, description: e.target.value})}
          className="border rounded-lg px-3 py-2 w-full h-32"
          required
        />

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Update Job
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;