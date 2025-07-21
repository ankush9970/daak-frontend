import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, load } = useAuth();

  if (load) {
    return null;
  }

  if (!load && (!user || !user.token)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
