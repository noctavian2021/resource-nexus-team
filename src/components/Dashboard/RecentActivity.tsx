
import React from 'react';
import { Activity } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTeamMemberById } from '@/data/mockData';
import { CalendarClock, UserCircle2, FolderGit2, Building2, LayoutGrid, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface RecentActivityProps {
  activities: Activity[];
}

// Extend the Activity type to include our new absence types
type ExtendedActivityType = 'assignment' | 'project_update' | 'department_change' | 'resource_request' | 'absence_start' | 'absence_end';

export default function RecentActivity({ activities }: RecentActivityProps) {
  // Ensure activities is an array
  const safeActivities = Array.isArray(activities) ? activities : [];
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <UserCircle2 className="h-4 w-4" />;
      case 'project_update':
        return <FolderGit2 className="h-4 w-4" />;
      case 'department_change':
        return <Building2 className="h-4 w-4" />;
      case 'resource_request':
        return <LayoutGrid className="h-4 w-4" />;
      case 'absence_start':
        return <Calendar className="h-4 w-4" />;
      case 'absence_end':
        return <Calendar className="h-4 w-4" />;
      default:
        return <CalendarClock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {safeActivities.length > 0 ? (
        safeActivities.map((activity) => {
          const member = getTeamMemberById(activity.userId);
          return (
            <div key={activity.id} className="flex">
              <div className="relative mr-4 flex h-6 w-6 flex-none items-center justify-center">
                <div className="absolute -bottom-6 top-8 left-2.5 w-px bg-border" />
                <div className={`bg-background border-primary flex h-6 w-6 items-center justify-center rounded-full border ${
                  activity.type === 'absence_start' ? 'text-amber-500' :
                  activity.type === 'absence_end' ? 'text-green-500' : 'text-primary'
                }`}>
                  {getActivityIcon(activity.type)}
                </div>
              </div>
              <div className="flex flex-col gap-0.5 pb-8">
                <p className="text-sm font-medium">{activity.description}</p>
                <time className="text-xs text-muted-foreground">
                  {format(new Date(activity.timestamp), 'MMM d, yyyy · h:mm a')}
                </time>
                {member && (
                  <span className="text-xs text-muted-foreground">
                    {member.name} ({member.role})
                  </span>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No recent activities</p>
        </div>
      )}
    </div>
  );
}
