
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FolderKanban, Grid3X3, PieChart, Clock, FileCheck } from 'lucide-react';
import { Metrics } from '@/data/mockData';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  suffix?: string;
}

const MetricCard = ({ title, value, icon, suffix }: MetricCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {value}
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </CardContent>
  </Card>
);

interface DashboardMetricsProps {
  metrics: Metrics;
}

export default function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Team Members"
        value={metrics.teamMemberCount}
        icon={<Users className="h-4 w-4" />}
      />
      <MetricCard
        title="Active Projects"
        value={metrics.activeProjects}
        icon={<FolderKanban className="h-4 w-4" />}
      />
      <MetricCard
        title="Departments"
        value={metrics.totalDepartments}
        icon={<Grid3X3 className="h-4 w-4" />}
      />
      <MetricCard
        title="Resource Utilization"
        value={metrics.resourceUtilization}
        suffix="%"
        icon={<PieChart className="h-4 w-4" />}
      />
      <MetricCard
        title="Pending Requests"
        value={metrics.pendingRequests}
        icon={<Clock className="h-4 w-4" />}
      />
      <MetricCard
        title="Upcoming Deadlines"
        value={metrics.upcomingDeadlines}
        icon={<FileCheck className="h-4 w-4" />}
      />
    </div>
  );
}
