
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useEmailConfig } from '@/hooks/useEmailConfig';
import { playNotificationSound } from '@/utils/sound';
import apiRequest from '@/services/api';
import { departments, teamMembers as localTeamMembers } from '@/data/mockData';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category?: 'general' | 'report' | 'request' | 'absence';
}

export interface NotificationOptions {
  emailRecipient?: string;
  recipientName?: string;
  skipEmail?: boolean;
  additionalEmailContent?: string;
  targetDepartmentId?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { emailConfig } = useEmailConfig();

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error loading notifications from localStorage:', err);
    }
    
    // Set up event listener for receiving notifications
    const handleReceiveNotification = () => {
      playNotificationSound().catch(err => {
        console.log('Error playing notification sound (receiver):', err);
      });
    };
    
    window.addEventListener('receive-notification', handleReceiveNotification);
    
    return () => {
      window.removeEventListener('receive-notification', handleReceiveNotification);
    };
  }, []);

  // Find department lead's email directly from team members data
  const findDepartmentLeadEmail = (departmentId: string): { email: string, name: string } => {
    try {
      // First find the department to get the leadId
      const department = departments.find(dept => dept.id === departmentId);
      if (!department || !department.leadId) {
        console.log(`Department not found or no lead assigned for department ID: ${departmentId}`);
        return { email: '', name: '' };
      }
      
      console.log(`Looking for lead with ID ${department.leadId} for department ${department.name}`);
      
      // Find the team member who is the lead
      const leadMember = localTeamMembers.find(member => member.id === department.leadId);
      if (leadMember) {
        console.log(`Found department lead: ${leadMember.name} (${leadMember.email})`);
        return { email: leadMember.email, name: leadMember.name };
      } else {
        // Try to find any team member who is marked as lead in this department
        const departmentLead = localTeamMembers.find(
          member => member.department === department.name && member.isLead
        );
        
        if (departmentLead) {
          console.log(`Found department lead by role: ${departmentLead.name} (${departmentLead.email})`);
          return { email: departmentLead.email, name: departmentLead.name };
        }
      }
      
      console.log(`Could not find lead for department ID: ${departmentId}`);
      return { email: '', name: '' };
    } catch (error) {
      console.error('Error finding department lead:', error);
      return { email: '', name: '' };
    }
  };

  // Add a new notification
  const addNotification = async (
    title: string, 
    message: string, 
    category: 'general' | 'report' | 'request' | 'absence' = 'general',
    options: NotificationOptions = {}
  ) => {
    try {
      const newNotification: Notification = {
        id: Date.now().toString(),
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
        category,
      };

      const updatedNotifications = [newNotification, ...notifications];
      setNotifications(updatedNotifications);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

      // Play notification sound for the sender
      playNotificationSound().catch(err => {
        console.log('Error playing notification sound (sender):', err);
      });

      // Show toast for new notification
      toast({
        title,
        description: message,
        variant: "default",
        duration: 5000,
      });

      // If email is configured and we have a recipient, send an email notification
      if (emailConfig.enabled && !options.skipEmail && 
         (category === 'report' || category === 'request' || options.emailRecipient)) {
        
        try {
          // Determine the recipient email - either from options or find department lead
          let recipientEmail = options.emailRecipient || '';
          let recipientName = options.recipientName || '';
          
          // If targetDepartmentId is provided and we don't have an explicit recipient,
          // try to find the department lead's email
          if (options.targetDepartmentId && !recipientEmail) {
            const leadInfo = findDepartmentLeadEmail(options.targetDepartmentId);
            recipientEmail = leadInfo.email;
            recipientName = leadInfo.name;
            console.log(`Using department lead email: ${recipientEmail} (${recipientName})`);
          }
          
          // Fallback if we still don't have an email
          if (!recipientEmail) {
            recipientEmail = localStorage.getItem('userEmail') || 'admin@example.com';
            recipientName = localStorage.getItem('userName') || 'User';
            console.log(`Using fallback email: ${recipientEmail}`);
          }
          
          console.log(`Sending ${category} notification email to:`, recipientEmail);
          
          // Add additional content if provided
          const additionalContent = options.additionalEmailContent || '';
          
          // Use the send-welcome endpoint which is known to work
          await apiRequest('/email/send-welcome', 'POST', {
            email: recipientEmail,
            name: recipientName,
            subject: `${title} - Notification`,
            startDate: new Date().toISOString().split('T')[0],
            replacingMember: '',
            additionalNotes: `
              ${title}
              
              ${message}
              
              Category: ${category}
              Time: ${new Date().toLocaleString()}
              ${additionalContent}
            `,
            emailConfig: {
              ...emailConfig,
              port: String(emailConfig.port),
              secure: emailConfig.port === '465' ? true : (emailConfig.port === '587' ? false : emailConfig.secure),
              connectionTimeout: 30000,
              greetingTimeout: 30000
            }
          });
          
          console.log(`Email notification for ${category} sent successfully to ${recipientEmail}`);
        } catch (emailErr) {
          console.error('Error sending email notification:', emailErr);
        }
      }
      
      // Dispatch custom event for other users/tabs to play the sound
      const event = new CustomEvent('receive-notification', { 
        detail: { notification: newNotification } 
      });
      window.dispatchEvent(event);
      
      return newNotification;
    } catch (err) {
      console.error('Error adding notification:', err);
      return null;
    }
  };

  // Mark a notification as read
  const markAsRead = (notificationId: string) => {
    try {
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      setNotifications(updatedNotifications);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  };

  // Clear all notifications
  const clearNotifications = () => {
    try {
      setNotifications([]);
      localStorage.removeItem('notifications');
      return true;
    } catch (err) {
      console.error('Error clearing notifications:', err);
      return false;
    }
  };

  // Get notifications by category
  const getNotificationsByCategory = (category: string) => {
    return notifications.filter(n => n.category === category);
  };

  // Get count of unread notifications
  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  return { 
    notifications, 
    addNotification,
    markAsRead,
    clearNotifications,
    getNotificationsByCategory,
    getUnreadCount,
    findDepartmentLeadEmail
  };
};
