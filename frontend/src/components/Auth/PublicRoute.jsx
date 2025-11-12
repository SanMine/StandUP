import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  // If user is logged in, redirect to their dashboard
  if (user) {
    if (user.role === 'employer') {
      return <Navigate to="/employer-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default PublicRoute;
