
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Login from "./pages/Login";
import Index from "./pages/Index";
import TeamMembers from "./pages/TeamMembers";
import Departments from "./pages/Departments";
import DepartmentDetail from "./pages/DepartmentDetail";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/Layout/Sidebar";
import ResourceRequests from "./pages/ResourceRequests";
import AdminSettings from "./pages/AdminSettings";
import GeneralReport from "./pages/GeneralReport";
import HelpTab from "./pages/HelpTab";
import UserProfile from "./pages/UserProfile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <div className="flex min-h-screen w-full">
                  <Sidebar />
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/team" element={<TeamMembers />} />
                      <Route path="/departments" element={<Departments />} />
                      <Route path="/departments/:departmentId" element={<DepartmentDetail />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/requests" element={<ResourceRequests />} />
                      <Route path="/admin/settings" element={<AdminSettings />} />
                      <Route path="/reports/general" element={<GeneralReport />} />
                      <Route path="/help" element={<HelpTab />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
