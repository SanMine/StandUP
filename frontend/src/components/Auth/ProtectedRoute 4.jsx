import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requireRole }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // or a spinner component

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Role-based protection
  if (requireRole && user.role !== requireRole) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'employer') {
      return <Navigate to="/employer-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
