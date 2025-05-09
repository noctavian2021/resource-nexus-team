
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Logger utility to conditionally log based on environment
const logger = {
  log: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[PROTECTED ROUTE] ${message}`, ...args);
    }
  }
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  logger.log("ProtectedRoute check - User:", user, "Path:", location.pathname);

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
    logger.log("No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For role-based restrictions
  const isRestrictedAdminRoute = location.pathname.includes('/admin') && user.role !== 'admin';
  
  if (isRestrictedAdminRoute) {
    logger.log("User doesn't have admin access, redirecting to dashboard");
    return <Navigate to="/" replace />;
  }

  // Render children if authenticated and authorized
  logger.log("User authorized, rendering protected content");
  return <>{children}</>;
}
