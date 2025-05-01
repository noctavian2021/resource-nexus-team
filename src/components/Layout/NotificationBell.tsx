
import React, { useEffect } from 'react';
import { Bell, CheckCheck, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/useNotifications';
import { format } from 'date-fns';
import { useEmailConfig } from '@/hooks/useEmailConfig';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { playNotificationSound } from '@/utils/sound';

export default function NotificationBell() {
  const { notifications, markAsRead, clearNotifications } = useNotifications();
  const { emailConfig } = useEmailConfig();
  const unreadCount = notifications.filter(n => !n.read).length;

  // Listen for incoming notifications from other components/users
  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      // Play sound when receiving a notification
      playNotificationSound().catch(err => {
        console.log('Error playing notification sound in NotificationBell:', err);
      });
    };

    // Add event listener
    window.addEventListener('receive-notification', handleNotification as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('receive-notification', handleNotification as EventListener);
    };
  }, []);

  const handleItemClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  // Get the icon for a notification based on its category
  const getNotificationIcon = (category?: string) => {
    switch (category) {
      case 'absence':
        return <Calendar className="h-4 w-4 text-amber-500" />;
      case 'report':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'request':
        return <Bell className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center gap-1">
      {emailConfig.enabled && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-white/70">
              <Mail className="h-4 w-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Email notifications enabled</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          {notifications.length > 0 ? (
            <>
              {notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id} 
                  className={`flex flex-col items-start p-4 ${notification.read ? 'bg-muted/40' : ''}`}
                  onClick={() => handleItemClick(notification.id)}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="font-medium flex items-center gap-1">
                      {getNotificationIcon(notification.category)}
                      {notification.title}
                    </div>
                    {notification.category && (
                      <Badge variant="outline" className="text-xs">
                        {notification.category}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{notification.message}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between w-full">
                    <span>{format(new Date(notification.timestamp), 'MMM d, yyyy h:mm a')}</span>
                    {notification.read && <CheckCheck className="h-3 w-3 text-green-500" />}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex justify-center text-sm text-muted-foreground cursor-pointer"
                onClick={() => clearNotifications()}
              >
                Clear all
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
