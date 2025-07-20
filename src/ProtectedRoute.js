import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user || !user.token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
