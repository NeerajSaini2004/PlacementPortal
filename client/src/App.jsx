import React, { useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { JobProvider } from './contexts/JobsContext';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import BrowseJobs from './pages/BrowseJobs.jsx';
import Companies from './pages/Companies.jsx';
import Dashboard from './pages/Dashboard.jsx';
import StudentProfile from './pages/StudentProfile.jsx';
import JobPosting from './pages/JobPosting.jsx';
import EditJob from './pages/EditJob.jsx';
import NotificationCenter from './components/NotificationCenter.jsx';
import AIChatbot from './components/AIChatbot.jsx';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent hover:from-blue-700 hover:to-blue-900 transition-all duration-300">
            🎓 MBM Portal
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link to="/companies" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group">
              Companies
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link to="/jobs" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group">
              Browse Jobs
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group">
                Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              {user?.role === 'student' && (
                <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group">
                  Profile
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
              )}
              {user?.role === 'recruiter' && (
                <Link to="/post-job" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group">
                  Post Job
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
              )}
            </>
          )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => {
                  setShowNotifications(true);
                  setUnreadCount(0);
                }}
                className="relative p-3 text-gray-600 hover:text-blue-600 transition-colors duration-200 hover:bg-blue-50 rounded-full"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                  </svg>
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div className="hidden md:flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-gray-700 font-medium">Welcome, {user?.name}</span>
              </div>
              <button 
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">Login</Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
    <NotificationCenter 
      isOpen={showNotifications} 
      onClose={() => setShowNotifications(false)} 
    />
    
    {/* Floating AI Assistant Button */}
    {isAuthenticated && (
      <>
        <button
          onClick={() => setShowAIChat(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 z-40 transform hover:scale-110 animate-bounce"
        >
          <span className="text-2xl">🤖</span>
        </button>
        
        <AIChatbot 
          isOpen={showAIChat} 
          onClose={() => setShowAIChat(false)} 
        />
      </>
    )}
    </>
  );
};

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (role && user?.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="pt-20">
        <Routes>
        <Route path="/" element={<Navigate to="/companies" replace />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/jobs" element={<BrowseJobs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <StudentProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/post-job" 
          element={
            <ProtectedRoute>
              <JobPosting />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit-job/:id" 
          element={
            <ProtectedRoute>
              <EditJob />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/companies" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <AppContent />
      </JobProvider>
    </AuthProvider>
  );
}

export default App;