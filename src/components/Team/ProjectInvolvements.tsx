
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { TeamMember } from '@/data/mockData';
import { getProject, getProjects } from '@/services/projectService';
import { Project } from '@/data/mockData';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectInvolvementsProps {
  member: TeamMember;
}

export default function ProjectInvolvements({ member }: ProjectInvolvementsProps) {
  const [projectsData, setProjectsData] = useState<{[key: string]: Project | null}>({});
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      const projectIds = new Set<string>();
      const customProjectNames = new Set<string>();
      
      // Collect all project IDs from both involvements and direct projects array
      if (member.projectInvolvements && member.projectInvolvements.length > 0) {
        member.projectInvolvements.forEach(inv => {
          // Check if this is a custom project (has a specific format)
          if (inv.projectId.startsWith('custom-')) {
            customProjectNames.add(inv.projectId);
          } else {
            projectIds.add(inv.projectId);
          }
        });
      }
      
      if (member.projects && member.projects.length > 0) {
        member.projects.forEach(id => {
          if (id.startsWith('custom-')) {
            customProjectNames.add(id);
          } else {
            projectIds.add(id);
          }
        });
      }
      
      // First get all projects to have the full list available
      try {
        const allProjectsData = await getProjects();
        setAllProjects(allProjectsData);
        
        // Add all projects to the map for reference
        const projectMap: {[key: string]: Project | null} = {};
        
        // Handle regular projects that exist in the database
        const projectPromises = Array.from(projectIds).map(async (id) => {
          try {
            console.log(`Fetching project with ID: ${id}`);
            const project = await getProject(id);
            console.log(`Project fetched: ${project?.name || 'unknown'}`);
            return [id, project] as [string, Project | null];
          } catch (error) {
            console.error(`Failed to fetch project ${id}:`, error);
            return [id, null] as [string, null];
          }
        });
        
        // For custom projects, create temporary project objects
        customProjectNames.forEach(customId => {
          const displayName = customId.replace('custom-', '').replace(/-/g, ' ');
          projectMap[customId] = {
            id: customId,
            name: displayName.charAt(0).toUpperCase() + displayName.slice(1), // Capitalize first letter
            description: "Custom project",
            status: "Active", // Fix: changed "active" to "Active" to match the type
            startDate: new Date().toISOString(),
            endDate: null,
            budget: null,
            department: member.department,
            teamMembers: [member.id],
            departmentId: '', // Added to match Project interface
            progress: 0, // Added to match Project interface
            priority: 'Medium' // Added to match Project interface
          } as Project; // Use type assertion for the whole object
        });
        
        const projectEntries = await Promise.all(projectPromises);
        projectEntries.forEach(([id, project]) => {
          if (typeof id === 'string') {
            projectMap[id] = project;
          }
        });
        
        setProjectsData(projectMap);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setError("Failed to load project data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [member.projectInvolvements, member.projects, member.department, member.id]);
  
  if (isLoading) {
    return (
      <div>
        <p className="mb-1 text-sm font-medium">Projects</p>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <p className="mb-1 text-sm font-medium">Projects</p>
      <div className="space-y-1">
        {member.projectInvolvements && member.projectInvolvements.length > 0 ? (
          member.projectInvolvements.map((involvement, index) => {
            const project = projectsData[involvement.projectId];
            return project ? (
              <div key={`involvement-${involvement.projectId}-${index}`} className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {project.name}
                </p>
                <Badge variant="outline">{involvement.percentage}%</Badge>
              </div>
            ) : null;
          })
        ) : member.projects && member.projects.length > 0 ? (
          member.projects.map((projectId) => {
            const project = projectsData[projectId];
            return project ? (
              <p key={`project-${projectId}`} className="text-sm text-muted-foreground">
                {project.name}
              </p>
            ) : null;
          })
        ) : (
          <p className="text-sm text-muted-foreground">No active projects</p>
        )}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {(Object.keys(projectsData).length === 0 && 
         ((member.projectInvolvements && member.projectInvolvements.length > 0) || 
          (member.projects && member.projects.length > 0)) && !error) && (
          <p className="text-sm text-muted-foreground">Unable to load project data</p>
        )}
      </div>
    </div>
  );
}
