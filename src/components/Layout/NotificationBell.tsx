
import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
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

export default function NotificationBell() {
  const { notifications, markAsRead, clearNotifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleItemClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  return (
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
                <div className="font-medium">{notification.title}</div>
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
  );
}
