import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { JobProvider } from './contexts/JobContext';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Jobs from './pages/Jobs.jsx';
import Dashboard from './pages/Dashboard.jsx';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold">
            PlacementPortal
          </Link>
          <Link to="/jobs" className="text-gray-600 hover:text-gray-800">Jobs</Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">Dashboard</Link>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-600">Welcome, {user?.name}</span>
              <button 
                onClick={logout}
                className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-400"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-600 hover:text-blue-800">Login</Link>
              <Link 
                to="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/jobs" replace />} />
        <Route path="/jobs" element={<Jobs />} />
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
        <Route path="*" element={<Navigate to="/jobs" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <Router>
          <AppContent />
        </Router>
      </JobProvider>
    </AuthProvider>
  );
}

export default App;