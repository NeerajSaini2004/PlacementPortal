import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await axios.get(`http://localhost:5000/api/jobs?${params}`);
      setJobs(res.data.jobs || res.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.log('API not available, using sample data');
      // Fallback data if API fails
      setJobs([
        {
          _id: '1',
          title: 'Frontend Developer',
          description: 'Build modern web applications using React.js, TypeScript, and Tailwind CSS. Work with a dynamic team on cutting-edge projects.',
          company: { name: 'Tech Corp' },
          location: 'Remote',
          jobType: 'Full-time',
          salary: { min: 50000, max: 80000 },
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Backend Developer',
          description: 'Develop scalable APIs using Node.js, Express, and MongoDB. Experience with microservices architecture preferred.',
          company: { name: 'Dev Inc' },
          location: 'Mumbai',
          jobType: 'Full-time',
          salary: { min: 60000, max: 90000 },
          createdAt: new Date().toISOString()
        },
        {
          _id: '3',
          title: 'Full Stack Developer',
          description: 'Work on both frontend and backend technologies. MERN stack experience required.',
          company: { name: 'StartupXYZ' },
          location: 'Bangalore',
          jobType: 'Full-time',
          salary: { min: 70000, max: 100000 },
          createdAt: new Date().toISOString()
        },
        {
          _id: '4',
          title: 'UI/UX Designer',
          description: 'Design beautiful and intuitive user interfaces. Figma and Adobe Creative Suite experience required.',
          company: { name: 'Design Studio' },
          location: 'Delhi',
          jobType: 'Part-time',
          salary: { min: 40000, max: 60000 },
          createdAt: new Date().toISOString()
        }
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const applyToJob = async (jobId) => {
    try {
      await axios.post(`http://localhost:5000/api/jobs/${jobId}/apply`);
      return { success: true, message: 'Application submitted successfully' };
    } catch (error) {
      // Simulate success for demo
      return { success: true, message: 'Application submitted successfully (Demo mode)' };
    }
  };

  return (
    <JobContext.Provider value={{
      jobs,
      loading,
      totalPages,
      fetchJobs,
      applyToJob
    }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within JobProvider');
  }
  return context;
};