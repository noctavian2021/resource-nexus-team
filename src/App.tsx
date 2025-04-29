
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
