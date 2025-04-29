
import { useState, useEffect } from 'react';
import { useEmailConfig } from '@/hooks/useEmailConfig';
import { useNotifications } from '@/hooks/useNotifications';
import { teamMembers, recentActivities } from '@/data/mockData';

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

// This hook manages scheduled reports
export const useScheduledReports = () => {
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(defaultScheduleConfig);
  const { emailConfig } = useEmailConfig();
  const { addNotification } = useNotifications();
  
  // Load config from localStorage on mount
  useEffect(() => {
    const storedConfig = localStorage.getItem('scheduleConfig');
    if (storedConfig) {
      setScheduleConfig(JSON.parse(storedConfig));
    }
  }, []);
  
  // Setup a timer to check every minute if reports need to be sent
  useEffect(() => {
    if (!scheduleConfig.enabled || !emailConfig.enabled) return;
    
    const checkSchedule = () => {
      if (isTimeToSend(scheduleConfig.sendTime)) {
        console.log('Time to send scheduled report!');
        
        // In a real app, this would make an API call to send the email
        sendScheduledReport(scheduleConfig);
        
        // Add an in-app notification about the sent report
        addNotification(
          'Scheduled Report Sent',
          `The ${scheduleConfig.reportType} report was sent to ${scheduleConfig.recipients.length} recipients.`
        );
      }
    };
    
    // Check once on mount
    checkSchedule();
    
    // Check every minute
    const interval = setInterval(checkSchedule, 60000);
    return () => clearInterval(interval);
  }, [scheduleConfig, emailConfig.enabled, addNotification]);
  
  // Mock function to "send" the scheduled report
  const sendScheduledReport = (config: ScheduleConfig) => {
    // In a real application, this would make an API call to send the email
    console.log('Sending scheduled report:', config);
    console.log('Email config:', emailConfig);
    console.log('Recipients:', config.recipients);
    
    // In a real app, you would generate the PDF report and send it via email
    // For now, we'll just log that we sent it
    return true;
  };
  
  const updateScheduleConfig = (config: Partial<ScheduleConfig>) => {
    const updatedConfig = { ...scheduleConfig, ...config };
    setScheduleConfig(updatedConfig);
    localStorage.setItem('scheduleConfig', JSON.stringify(updatedConfig));
    return updatedConfig;
  };
  
  // Function to manually trigger a scheduled report
  const sendReportNow = (): boolean => {
    if (!emailConfig.enabled) return false;
    
    const success = sendScheduledReport(scheduleConfig);
    
    if (success) {
      addNotification(
        'Manual Report Sent',
        `The ${scheduleConfig.reportType} report was sent to ${scheduleConfig.recipients.length} recipients.`
      );
    }
    
    return success;
  };
  
  return {
    scheduleConfig,
    updateScheduleConfig,
    sendReportNow,
    isEmailConfigured: emailConfig.enabled
  };
};
