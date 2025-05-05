import React, { useEffect, useState } from 'react';
import Header from '@/components/Layout/Header';
import RequestList from '@/components/ResourceRequests/RequestList';
import { resourceRequests } from '@/data/mockData';
import CreateRequestDialog from '@/components/ResourceRequests/CreateRequestDialog';
import { useEmailConfig } from '@/hooks/useEmailConfig';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Settings, Bell, Mail, Users, Filter, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDepartments } from '@/services/departmentService';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { teamMembers } from '@/data/mockData';
import { useNotifications } from '@/hooks/useNotifications';

export default function ResourceRequests() {
  const { emailConfig } = useEmailConfig();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [showEmailAlert, setShowEmailAlert] = useState(false);
  const [showAllDepartments, setShowAllDepartments] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  
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

  // Function to send a direct test email to Mirela
  const sendDirectTestToMirela = async () => {
    try {
      setSendingTestEmail(true);
      
      // Find Mirela in team members
      const mirela = teamMembers.find(member => member.name.toLowerCase().includes('mirela'));
      
      if (!mirela) {
        toast({
          title: "Error",
          description: "Mirela not found in team members",
          variant: "destructive"
        });
        return;
      }
      
      console.log(`Sending direct test to Mirela: ${mirela.name} (${mirela.email})`);
      
      // Get Product department
      const productDept = departments.find(dept => dept.name === 'Product');
      
      if (emailConfig.enabled) {
        try {
          // Send via welcome email API (more reliable than test API)
          const response = await fetch('http://localhost:5000/api/email/send-welcome', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: mirela.email,
              name: mirela.name,
              subject: '⚠️ URGENT: Direct Test Email',
              startDate: new Date().toISOString().split('T')[0],
              replacingMember: '',
              additionalNotes: 'This is a direct test email sent via the welcome email API to verify email delivery.',
              emailConfig: {
                ...emailConfig,
                port: String(emailConfig.port),
                secure: emailConfig.port === '465' ? true : (emailConfig.port === '587' ? false : emailConfig.secure),
                connectionTimeout: 30000,
                greetingTimeout: 30000
              }
            })
          });
          
          const result = await response.json();
          console.log('Direct test email result:', result);
          
          if (result.success) {
            toast({
              title: "Direct Test Email Sent",
              description: `Test email sent directly to ${mirela.name}`,
            });
          } else {
            throw new Error(result.error || 'Unknown error');
          }
        } catch (error) {
          console.error('Error sending direct test email:', error);
          toast({
            title: "Direct Test Failed",
            description: String(error),
            variant: "destructive"
          });
        }
      }
      
      // Also send via standard notification system
      await addNotification(
        "URGENT TEST NOTIFICATION",
        `This is a test notification for ${mirela.name}`,
        'request',
        {
          emailRecipient: mirela.email, 
          recipientName: mirela.name,
          targetDepartmentId: productDept?.id,
          forceMirelaAsRecipient: true,
          additionalEmailContent: "This notification was sent as a direct test from the Resource Requests page."
        }
      );
      
      toast({
        title: "Test Notification Sent",
        description: `Notification sent to ${mirela.name}`,
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setSendingTestEmail(false);
    }
  };

  return (
    <>
      <Header title="Resource Requests" />
      <main className="flex-1 space-y-6 p-6">
        {showEmailAlert && (
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-800">Email notifications not enabled</AlertTitle>
            <div className="flex items-center justify-between">
              <AlertDescription className="text-amber-700">
                Configure and enable email settings to send notification emails when creating resource requests.
                Recipients will only see in-app notifications until email is configured.
              </AlertDescription>
              <Button asChild variant="outline" size="sm" className="ml-4 bg-amber-100 hover:bg-amber-200 border-amber-300">
                <Link to="/admin/settings">
                  <Settings className="h-4 w-4 mr-1" />
                  Configure Email
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
              {emailConfig.enabled ? (
                <>
                  <span className="mx-1">•</span>
                  <Mail className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Email alerts enabled</span>
                </>
              ) : (
                <>
                  <span className="mx-1">•</span>
                  <Mail className="h-4 w-4 text-muted-foreground opacity-50" />
                  <span className="text-muted-foreground opacity-50">Email alerts disabled</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Admin testing button */}
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={sendDirectTestToMirela}
                disabled={sendingTestEmail}
                className="flex items-center gap-1 border-blue-300"
              >
                <Send className="h-4 w-4 text-blue-600" />
                {sendingTestEmail ? "Sending..." : "Test Mirela's Email"}
              </Button>
            )}
          
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
