import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import StudentDashboard from './StudentDashboard';

import TPODashboard from './TPODashboard';

const RecruiterDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Active Jobs</h3>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">💼</span>
          </div>
        </div>
        <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">15</p>
        <p className="text-gray-600 font-medium">Currently hiring</p>
      </div>
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Applications</h3>
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">📄</span>
          </div>
        </div>
        <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">247</p>
        <p className="text-gray-600 font-medium">Total received</p>
      </div>
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Hired</h3>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">🎉</span>
          </div>
        </div>
        <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">45</p>
        <p className="text-gray-600 font-medium">This quarter</p>
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

  // For student role, return the student dashboard
  if (user?.role === 'student') {
    return <StudentDashboard />;
  }

  // For admin role, return the full TPODashboard component
  if (user?.role === 'admin') {
    return <TPODashboard />;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mb-6">
            <span className="text-2xl text-white">👋</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Here's what's happening with your {user?.role} account today
          </p>
        </div>
        
        {renderDashboard()}
        
        {/* Recent Activity */}
        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-lg">🕰️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">📄</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">New application received</p>
                  <p className="text-sm text-gray-600">Frontend Developer • 2 hours ago</p>
                </div>
              </div>
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                New
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Job posted successfully</p>
                  <p className="text-sm text-gray-600">Backend Developer • 1 day ago</p>
                </div>
              </div>
              <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full font-medium">
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