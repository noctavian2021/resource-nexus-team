
import React, { useEffect, useState } from 'react';
import Header from '@/components/Layout/Header';
import RequestList from '@/components/ResourceRequests/RequestList';
import { resourceRequests } from '@/data/mockData';
import CreateRequestDialog from '@/components/ResourceRequests/CreateRequestDialog';
import { useEmailConfig } from '@/hooks/useEmailConfig';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Settings, Bell, Mail, Users, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDepartments } from '@/services/departmentService';
import { useAuth } from '@/context/AuthContext';

export default function ResourceRequests() {
  const { emailConfig } = useEmailConfig();
  const { user } = useAuth();
  const [showEmailAlert, setShowEmailAlert] = useState(false);
  const [showAllDepartments, setShowAllDepartments] = useState(false);
  
  // Get current user's department ID from auth context
  const currentDepartmentId = user?.departmentId || '';
  const isAdmin = user?.role === 'admin';
  
  // Fetch departments for displaying department name
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments
  });
  
  // Get current department's name
  const currentDepartment = departments.find(dept => dept.id === currentDepartmentId);
  
  useEffect(() => {
    // Check if email is not configured yet
    if (!emailConfig.enabled) {
      setShowEmailAlert(true);
    } else {
      setShowEmailAlert(false);
    }
  }, [emailConfig]);

  return (
    <>
      <Header title="Resource Requests" />
      <main className="flex-1 space-y-6 p-6">
        {showEmailAlert && (
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Email notifications not configured</AlertTitle>
            <div className="flex items-center justify-between">
              <AlertDescription>
                Configure email settings to enable notification emails for resource requests.
              </AlertDescription>
              <Button asChild variant="outline" size="sm" className="ml-4">
                <Link to="/admin/settings">
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Link>
              </Button>
            </div>
          </Alert>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Resource Requests</h1>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span>
                {showAllDepartments 
                  ? 'Viewing all departments' 
                  : `Viewing ${currentDepartment?.name || 'your department'}`}
              </span>
            </div>
            
            <div className="flex gap-1 items-center text-sm text-muted-foreground">
              <Bell className="h-4 w-4" />
              <span>In-app notifications</span>
              <span className="mx-1">•</span>
              <Mail className="h-4 w-4" />
              <span>Email alerts</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Toggle for admin users to see all departments */}
            {isAdmin && (
              <Button 
                variant={showAllDepartments ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowAllDepartments(!showAllDepartments)}
                className="flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                {showAllDepartments ? "My Department" : "All Departments"}
              </Button>
            )}
            
            <CreateRequestDialog />
          </div>
        </div>
        
        <RequestList 
          requests={resourceRequests} 
          currentDepartmentId={currentDepartmentId}
          showAll={isAdmin && showAllDepartments}
        />
      </main>
    </>
  );
}
