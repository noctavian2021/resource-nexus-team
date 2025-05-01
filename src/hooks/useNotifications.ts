
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useEmailConfig } from '@/hooks/useEmailConfig';
import { playNotificationSound } from '@/utils/sound';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category?: 'general' | 'report' | 'request' | 'absence';
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

  // Add a new notification
  const addNotification = async (title: string, message: string, category: 'general' | 'report' | 'request' | 'absence' = 'general') => {
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

      // If email is configured, send an email notification for specific categories
      if (emailConfig.enabled && (category === 'report' || category === 'request')) {
        try {
          // Only send emails for reports and requests if configured
          console.log('Would send email notification using:', emailConfig);
          
          // In a real app, we could make an API call to send the email here
          // For now, we'll log that we would send it
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
    getUnreadCount
  };
};
