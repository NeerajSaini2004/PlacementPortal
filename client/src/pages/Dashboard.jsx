import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import StudentDashboard from './StudentDashboard';
import TPODashboard from './TPODashboard';

const RecruiterDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Active Jobs</h3>
        <p className="text-3xl font-bold text-blue-600">8</p>
        <p className="text-sm text-gray-500">Currently hiring</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Applications</h3>
        <p className="text-3xl font-bold text-green-600">156</p>
        <p className="text-sm text-gray-500">Total received</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Hired</h3>
        <p className="text-3xl font-bold text-purple-600">23</p>
        <p className="text-sm text-gray-500">This quarter</p>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return <TPODashboard />;
};

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'student':
        return <StudentDashboard />;
      case 'recruiter':
        return <RecruiterDashboard />;
      case 'admin':
        return <TPODashboard />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  // For student role, return the full StudentDashboard component
  if (user?.role === 'student') {
    return <StudentDashboard />;
  }

  // For admin role, return the full TPODashboard component
  if (user?.role === 'admin') {
    return <TPODashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your {user?.role} account
          </p>
        </div>
        
        {renderDashboard()}
        
        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">New application received</p>
                <p className="text-sm text-gray-500">Frontend Developer • 2 hours ago</p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                New
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Job posted successfully</p>
                <p className="text-sm text-gray-500">Backend Developer • 1 day ago</p>
              </div>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;