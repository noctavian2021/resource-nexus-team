
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log("ProtectedRoute check - User:", user, "Path:", location.pathname);

  // React effect to handle navigation instead of Navigate component
  React.useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      console.log("No user found, redirecting to login");
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }
    
    // For role-based restrictions
    if (!isLoading && user && location.pathname.includes('/admin') && user.role !== 'admin') {
      console.log("User doesn't have admin access, redirecting to dashboard");
      navigate("/", { replace: true });
      return;
    }
  }, [user, isLoading, location, navigate]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  // Don't render children until we're sure authentication is complete and user is authorized
  if (!user) {
    return null; // Don't render anything while redirecting
  }
  
  const isRestrictedAdminRoute = location.pathname.includes('/admin') && user.role !== 'admin';
  if (isRestrictedAdminRoute) {
    return null; // Don't render anything while redirecting
  }

  // Render children if authenticated and authorized
  console.log("User authorized, rendering protected content");
  return <>{children}</>;
}
