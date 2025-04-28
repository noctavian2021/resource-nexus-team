
import React, { useEffect } from 'react';
import Header from '@/components/Layout/Header';
import RequestList from '@/components/ResourceRequests/RequestList';
import { resourceRequests } from '@/data/mockData';
import CreateRequestDialog from '@/components/ResourceRequests/CreateRequestDialog';
import { useEmailConfig } from '@/hooks/useEmailConfig';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function ResourceRequests() {
  const { emailConfig } = useEmailConfig();
  const [showEmailAlert, setShowEmailAlert] = React.useState(false);
  
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
          <h1 className="text-2xl font-semibold tracking-tight">Resource Requests</h1>
          <CreateRequestDialog />
        </div>
        
        <RequestList requests={resourceRequests} />
      </main>
    </>
  );
}
