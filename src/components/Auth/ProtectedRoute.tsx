
import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);
  
  console.log("ProtectedRoute check - User:", user, "Path:", currentPath);

  // Update path when it changes
  React.useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };
    
    // Listen for navigation events
    window.addEventListener('popstate', updatePath);
    return () => window.removeEventListener('popstate', updatePath);
  }, []);

  // React effect to handle navigation
  React.useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      console.log("No user found, redirecting to login");
      window.location.href = "/login";
      return;
    }
    
    // For role-based restrictions
    if (!isLoading && user && currentPath.includes('/admin') && user.role !== 'admin') {
      console.log("User doesn't have admin access, redirecting to dashboard");
      window.location.href = "/";
      return;
    }
  }, [user, isLoading, currentPath]);

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
  
  const isRestrictedAdminRoute = currentPath.includes('/admin') && user.role !== 'admin';
  if (isRestrictedAdminRoute) {
    return null; // Don't render anything while redirecting
  }

  // Render children if authenticated and authorized
  console.log("User authorized, rendering protected content");
  return <>{children}</>;
}
