import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/Layout/Header';
import DashboardMetrics from '@/components/Dashboard/DashboardMetrics';
import AllocationChart from '@/components/Dashboard/AllocationChart';
import RecentActivity from '@/components/Dashboard/RecentActivity';
import { recentActivities, teamMembers, projects } from '@/data/mockData';
// Remove import of dashboardMetrics and allocationData
import TeamMemberCard from '@/components/Team/TeamMemberCard';
import ProjectCard from '@/components/Projects/ProjectCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { TeamMember } from '@/data/mockData';
import { FileText, Download, Calendar } from 'lucide-react';
import { ActivityReportDialog } from '@/components/Reports/ActivityReportDialog';
import { useScheduledReports } from '@/hooks/useScheduledReports';
import { useToast } from '@/hooks/use-toast';

// Add mock data here as temporary solution
const dashboardMetrics = [
  { title: 'Team Members', value: '24', change: 2 },
  { title: 'Available Resources', value: '68%', change: -5 },
  { title: 'Active Projects', value: '12', change: 1 },
  { title: 'Budget Utilized', value: '83%', change: 4 }
];

const allocationData = [
  { name: 'Development', allocation: 35, value: 35 },
  { name: 'Design', allocation: 20, value: 20 },
  { name: 'Marketing', allocation: 15, value: 15 },
  { name: 'Operations', allocation: 18, value: 18 },
  { name: 'HR', allocation: 12, value: 12 }
];

export default function Index() {
  const isMobile = useIsMobile();
  const [showActivityReport, setShowActivityReport] = useState(false);
  const { scheduleConfig } = useScheduledReports();
  const { toast } = useToast();
  
  // Ensure we're working with arrays
  const safeAllocationData = Array.isArray(allocationData) ? allocationData : [];
  const safeRecentActivities = Array.isArray(recentActivities) ? recentActivities : [];
  const safeTeamMembers = Array.isArray(teamMembers) ? teamMembers : [];
  const safeProjects = Array.isArray(projects) ? projects : [];
  
  const featuredMembers = safeTeamMembers.slice(0, 3);
  const activeProjects = safeProjects
    .filter(project => project.status === 'Active')
    .slice(0, 2);
  
  const handleMemberUpdated = (updatedMember: TeamMember) => {
    // On the dashboard we don't need to update the local state as this page
    // doesn't maintain its own state for team members - it just displays
    // featured members from the imported mockData
    console.log('Team member updated:', updatedMember);
    // In a real app, you might want to refresh the data or update global state here
  };

  useEffect(() => {
    // Show a toast when the page loads if report scheduling is enabled
    if (scheduleConfig.enabled) {
      toast({
        title: "Activity Report Scheduled",
        description: `Daily reports will be sent to ${scheduleConfig.recipients.length} recipients at ${scheduleConfig.sendTime}.`,
      });
    }
  }, []);
    
  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] dark:from-background dark:to-secondary/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">
            Dashboard
          </h1>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:from-[#7C3AED] hover:to-[#C026D3] text-white border-0"
              asChild
            >
              <Link to="/reports/general">Organization Map</Link>
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
              onClick={() => setShowActivityReport(true)}
            >
              <Download className="h-4 w-4 mr-1" />
              Activity Report
            </Button>
            {scheduleConfig.enabled && (
              <Button 
                size="sm" 
                variant="outline" 
                className="border-green-500 text-green-500 hover:bg-green-500/10"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Reports Scheduled
              </Button>
            )}
          </div>
        </div>
        
        <DashboardMetrics metrics={dashboardMetrics} />
        
        <div className="rounded-lg p-4 bg-gradient-to-br from-white to-[#D3E4FD] dark:from-card dark:to-accent/10 shadow-lg backdrop-blur-sm border border-border/50">
          <AllocationChart 
            data={safeAllocationData} 
            title="Department Resource Allocation" 
          />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="md:col-span-2 xl:col-span-2 rounded-lg bg-gradient-to-br from-white via-[#F1F0FB] to-[#E5DEFF] dark:from-card dark:to-accent/10 p-4 shadow-lg border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowActivityReport(true)}
              >
                <FileText className="h-4 w-4 mr-1" />
                Generate Report
              </Button>
            </div>
            <RecentActivity activities={safeRecentActivities} />
          </div>
          
          <div className="space-y-6 xl:col-span-1">
            <div className="rounded-lg bg-gradient-to-br from-white to-[#FFDEE2] dark:from-card dark:to-secondary/20 p-4 shadow-lg border border-border/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Team Highlights</h2>
                <Button variant="link" size="sm" asChild>
                  <Link to="/team">View All</Link>
                </Button>
              </div>
              <div className="mt-4 space-y-4">
                {featuredMembers.map(member => (
                  <TeamMemberCard 
                    key={member.id} 
                    member={member}
                    onEdit={() => handleMemberUpdated(member)}
                    onMemberUpdated={handleMemberUpdated}
                  />
                ))}
              </div>
            </div>
            
            <div className="rounded-lg bg-gradient-to-br from-white to-[#D3E4FD] dark:from-card dark:to-secondary/20 p-4 shadow-lg border border-border/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Active Projects</h2>
                <Button variant="link" size="sm" asChild>
                  <Link to="/projects">View All</Link>
                </Button>
              </div>
              <div className="mt-4 space-y-4">
                {activeProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ActivityReportDialog
        open={showActivityReport}
        onClose={() => setShowActivityReport(false)}
        activities={safeRecentActivities}
        teamMembers={safeTeamMembers}
      />
    </>
  );
}
