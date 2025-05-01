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

  useEffect(() => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
    
    // Set up event listener for receiving notifications
    window.addEventListener('receive-notification', () => {
      playNotificationSound().catch(err => {
        console.log('Error playing notification sound (receiver):', err);
      });
    });
    
    return () => {
      window.removeEventListener('receive-notification', () => {});
    };
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

    // If email is configured, simulate sending an email notification
    if (emailConfig.enabled) {
      console.log('Would send email notification using:', emailConfig);
      // In a real app, we would make an API call to send the email here
    }
    
    // Dispatch custom event for other users/tabs to play the sound
    const event = new CustomEvent('receive-notification', { 
      detail: { notification: newNotification } 
    });
    window.dispatchEvent(event);
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
