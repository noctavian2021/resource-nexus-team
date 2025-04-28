
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/Layout/Header';
import DashboardMetrics from '@/components/Dashboard/DashboardMetrics';
import AllocationChart from '@/components/Dashboard/AllocationChart';
import RecentActivity from '@/components/Dashboard/RecentActivity';
import { dashboardMetrics, allocationData, recentActivities, teamMembers, projects } from '@/data/mockData';
import TeamMemberCard from '@/components/Team/TeamMemberCard';
import ProjectCard from '@/components/Projects/ProjectCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Index() {
  const isMobile = useIsMobile();
  
  // Get a few team members for the dashboard preview
  const featuredMembers = teamMembers.slice(0, 3);
  
  // Get a few active projects for the dashboard preview
  const activeProjects = projects
    .filter(project => project.status === 'Active')
    .slice(0, 2);
    
  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Generate Report</Button>
          </div>
        </div>
        
        <DashboardMetrics metrics={dashboardMetrics} />
        
        <AllocationChart data={allocationData} />
        
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="md:col-span-2 xl:col-span-2">
            <RecentActivity activities={recentActivities} />
          </div>
          
          <div className="space-y-6 xl:col-span-1">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Team Highlights</h2>
                <Button variant="link" size="sm" asChild>
                  <Link to="/team">View All</Link>
                </Button>
              </div>
              <div className="mt-4 space-y-4">
                {featuredMembers.map(member => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
            
            <div>
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
    </>
  );
}
