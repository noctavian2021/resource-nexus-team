
import React from 'react';
import { Metrics } from '@/data/mockData';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  FolderGit2, 
  Building2, 
  PercentCircle, 
  ClipboardList,
  CalendarClock
} from 'lucide-react';

interface DashboardMetricsProps {
  metrics: Metrics;
}

export default function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  // Ensure metrics exists with default values if not
  const safeMetrics = metrics || {
    teamMemberCount: 0,
    activeProjects: 0,
    totalDepartments: 0,
    resourceUtilization: 0,
    pendingRequests: 0,
    upcomingDeadlines: 0
  };
  
  const metricsData = [
    {
      title: "Team Members",
      value: safeMetrics.teamMemberCount,
      icon: <Users className="h-4 w-4 text-blue-500" />
    },
    {
      title: "Active Projects",
      value: safeMetrics.activeProjects,
      icon: <FolderGit2 className="h-4 w-4 text-green-500" />
    },
    {
      title: "Departments",
      value: safeMetrics.totalDepartments,
      icon: <Building2 className="h-4 w-4 text-violet-500" />
    },
    {
      title: "Resource Utilization",
      value: `${safeMetrics.resourceUtilization}%`,
      icon: <PercentCircle className="h-4 w-4 text-amber-500" />
    },
    {
      title: "Pending Requests",
      value: safeMetrics.pendingRequests,
      icon: <ClipboardList className="h-4 w-4 text-red-500" />
    },
    {
      title: "Upcoming Deadlines",
      value: safeMetrics.upcomingDeadlines,
      icon: <CalendarClock className="h-4 w-4 text-indigo-500" />
    }
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {metricsData.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                {metric.icon}
                <span className="text-sm font-medium">{metric.title}</span>
              </div>
              <span className="text-2xl font-bold">{metric.value}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
