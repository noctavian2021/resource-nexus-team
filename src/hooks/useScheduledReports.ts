
import { useState, useEffect } from 'react';
import { useEmailConfig } from '@/hooks/useEmailConfig';
import { useNotifications } from '@/hooks/useNotifications';
import { teamMembers, recentActivities } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

export interface ScheduleConfig {
  enabled: boolean;
  recipients: string[];
  sendTime: string; // Format: "HH:MM" (24-hour)
  reportType: 'activity' | 'resources' | 'organization';
  frequency: 'daily' | 'weekly' | 'monthly';
}

const defaultScheduleConfig: ScheduleConfig = {
  enabled: false,
  recipients: [],
  sendTime: '07:00',
  reportType: 'activity',
  frequency: 'daily',
};

// Function to check if it's time to send a report
const isTimeToSend = (timeString: string): boolean => {
  const now = new Date();
  const [hours, minutes] = timeString.split(':').map(Number);
  
  return now.getHours() === hours && now.getMinutes() === minutes;
};

// Function to validate an email address
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// This hook manages scheduled reports
export const useScheduledReports = () => {
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(defaultScheduleConfig);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { emailConfig } = useEmailConfig();
  const { addNotification } = useNotifications();
  
  // Load config from localStorage on mount
  useEffect(() => {
    try {
      const storedConfig = localStorage.getItem('scheduleConfig');
      if (storedConfig) {
        setScheduleConfig(JSON.parse(storedConfig));
      }
    } catch (err) {
      console.error('Failed to load schedule configuration:', err);
      setError('Failed to load scheduled reports configuration');
    }
  }, []);
  
  // Setup a timer to check every minute if reports need to be sent
  useEffect(() => {
    if (!scheduleConfig.enabled || !emailConfig.enabled) return;
    
    const checkSchedule = async () => {
      if (isTimeToSend(scheduleConfig.sendTime)) {
        console.log('Time to send scheduled report!');
        
        try {
          const success = await sendScheduledReport(scheduleConfig);
          
          if (success) {
            // Add an in-app notification about the sent report
            addNotification(
              'Scheduled Report Sent',
              `The ${scheduleConfig.reportType} report was sent to ${scheduleConfig.recipients.length} recipients.`,
              'report'
            );
          }
        } catch (err) {
          console.error('Failed to send scheduled report:', err);
        }
      }
    };
    
    // Check once on mount
    checkSchedule();
    
    // Check every minute
    const interval = setInterval(checkSchedule, 60000);
    return () => clearInterval(interval);
  }, [scheduleConfig, emailConfig.enabled, addNotification]);
  
  // Function to send the scheduled report
  const sendScheduledReport = async (config: ScheduleConfig): Promise<boolean> => {
    if (!emailConfig.enabled || !config.enabled) {
      return false;
    }
    
    if (config.recipients.length === 0) {
      setError('No recipients specified');
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Validate all recipient emails
      const invalidEmails = config.recipients.filter(email => !validateEmail(email));
      if (invalidEmails.length > 0) {
        setError(`Invalid email addresses: ${invalidEmails.join(', ')}`);
        return false;
      }
      
      // Get appropriate data based on report type
      let reportData: any;
      switch (config.reportType) {
        case 'activity':
          reportData = { activities: recentActivities.slice(0, 20) };
          break;
        case 'resources':
          reportData = { resources: teamMembers.flatMap(member => member.requiredResources || []) };
          break;
        case 'organization':
          reportData = { teamMembers };
          break;
      }
      
      // Make API call to send the report
      const response = await fetch('/api/email/send-activity-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: config.recipients,
          reportType: config.reportType,
          activities: reportData.activities || [],
          resources: reportData.resources || [],
          teamMembers: reportData.teamMembers || [],
          emailConfig: emailConfig
        }),
      });
      
      const result = await response.json();
      if (!result.success) {
        setError(result.error || 'Failed to send report');
        return false;
      }
      
      setError(null);
      return true;
    } catch (err: any) {
      setError(`Error sending report: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateScheduleConfig = (config: Partial<ScheduleConfig>) => {
    try {
      // Handle recipients separately to validate them
      if (config.recipients) {
        const invalidEmails = config.recipients.filter(email => !validateEmail(email));
        if (invalidEmails.length > 0) {
          toast({
            title: "Invalid Email Addresses",
            description: `The following emails are invalid: ${invalidEmails.join(', ')}`,
            variant: "destructive"
          });
          return null;
        }
      }
      
      const updatedConfig = { ...scheduleConfig, ...config };
      setScheduleConfig(updatedConfig);
      localStorage.setItem('scheduleConfig', JSON.stringify(updatedConfig));
      
      setError(null);
      return updatedConfig;
    } catch (err: any) {
      const errorMsg = `Failed to update schedule: ${err.message}`;
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return null;
    }
  };
  
  // Function to manually trigger a scheduled report
  const sendReportNow = async (): Promise<boolean> => {
    if (!emailConfig.enabled) {
      toast({
        title: "Email Not Configured",
        description: "Please configure email settings before sending reports.",
        variant: "destructive"
      });
      return false;
    }
    
    if (scheduleConfig.recipients.length === 0) {
      toast({
        title: "No Recipients",
        description: "Please add at least one recipient email address.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      const success = await sendScheduledReport(scheduleConfig);
      
      if (success) {
        addNotification(
          'Manual Report Sent',
          `The ${scheduleConfig.reportType} report was sent to ${scheduleConfig.recipients.length} recipients.`,
          'report'
        );
        
        toast({
          title: "Report Sent",
          description: `The report was sent to ${scheduleConfig.recipients.length} recipients.`
        });
      } else {
        toast({
          title: "Failed to Send Report",
          description: error || "An unknown error occurred",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (err: any) {
      const errorMsg = `Error sending report: ${err.message}`;
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    }
  };
  
  return {
    scheduleConfig,
    updateScheduleConfig,
    sendReportNow,
    isEmailConfigured: emailConfig.enabled,
    error,
    isLoading
  };
};
