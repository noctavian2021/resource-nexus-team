
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, getTeamMemberById } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const user = getTeamMemberById(activity.userId);
            const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
            
            return (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="relative h-10 w-10 flex-none">
                  <img
                    src={user?.avatar || 'https://i.pravatar.cc/150'}
                    alt={user?.name || 'User'}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
