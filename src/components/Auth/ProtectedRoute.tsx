
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For role-based restrictions
  // Admin can access everything
  // Team leads can only access their department data or common pages
  const isRestrictedAdminRoute = location.pathname.includes('/admin') && user.role !== 'admin';
  
  if (isRestrictedAdminRoute) {
    return <Navigate to="/" replace />;
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
}
