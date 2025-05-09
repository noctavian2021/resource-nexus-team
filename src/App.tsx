
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login";
import Index from "./pages/Index";
import TeamMembers from "./pages/TeamMembers";
import Departments from "./pages/Departments";
import DepartmentDetail from "./pages/DepartmentDetail";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";
import ResourceRequests from "./pages/ResourceRequests";
import AdminSettings from "./pages/AdminSettings";
import GeneralReport from "./pages/GeneralReport";
import HelpTab from "./pages/HelpTab";
import UserProfile from "./pages/UserProfile";
import { applyCspHeaders, sessionManager } from "./utils/security";
import { useToast } from "./hooks/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Session timeout handler component
const SessionTimeoutHandler = () => {
  const { logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Apply CSP headers in production
    if (process.env.NODE_ENV === 'production') {
      applyCspHeaders();
    }

    // Setup session monitoring
    sessionManager.startMonitoring(
      // Warning callback
      () => {
        toast({
          title: "Session Timeout Warning",
          description: "Your session will expire in 1 minute due to inactivity.",
          variant: "destructive",
        });
      },
      // Logout callback
      () => {
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity.",
        });
        logout();
      }
    );
  }, [logout, toast]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes wrapped in Layout component */}
            <Route path="/" element={
              <ProtectedRoute>
                <SessionTimeoutHandler />
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Index />} />
              <Route path="team" element={<TeamMembers />} />
              <Route path="departments" element={<Departments />} />
              <Route path="departments/:departmentId" element={<DepartmentDetail />} />
              <Route path="projects" element={<Projects />} />
              <Route path="requests" element={<ResourceRequests />} />
              <Route path="admin/settings" element={<AdminSettings />} />
              <Route path="reports/general" element={<GeneralReport />} />
              <Route path="help" element={<HelpTab />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            
            {/* Catch all route - redirect to login if not authenticated */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
