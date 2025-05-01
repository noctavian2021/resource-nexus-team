
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute check - User:", user, "Path:", location.pathname);

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
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For role-based restrictions
  const isRestrictedAdminRoute = location.pathname.includes('/admin') && user.role !== 'admin';
  
  if (isRestrictedAdminRoute) {
    console.log("User doesn't have admin access, redirecting to dashboard");
    return <Navigate to="/" replace />;
  }

  // Render children if authenticated and authorized
  console.log("User authorized, rendering protected content");
  return <>{children}</>;
}
