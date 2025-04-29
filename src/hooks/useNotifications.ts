
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useEmailConfig } from '@/hooks/useEmailConfig';

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

  useEffect(() => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
  }, []);

  const addNotification = (title: string, message: string, category: 'general' | 'report' | 'request' | 'absence' = 'general') => {
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

    // Show toast for new notification
    toast({
      title,
      description: message,
    });

    // If email is configured, simulate sending an email notification
    if (emailConfig.enabled) {
      console.log('Would send email notification using:', emailConfig);
      // In a real app, we would make an API call to send the email here
    }
  };

  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  const getNotificationsByCategory = (category: string) => {
    return notifications.filter(n => n.category === category);
  };

  return { 
    notifications, 
    addNotification,
    markAsRead,
    clearNotifications,
    getNotificationsByCategory
  };
};
