
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { TeamMember } from '@/data/mockData';
import { getProject } from '@/services/projectService';
import { Project } from '@/data/mockData';

interface ProjectInvolvementsProps {
  member: TeamMember;
}

export default function ProjectInvolvements({ member }: ProjectInvolvementsProps) {
  const [projectsData, setProjectsData] = useState<{[key: string]: Project | null}>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      const projectIds = new Set<string>();
      
      // Collect all project IDs from both involvements and direct projects array
      if (member.projectInvolvements && member.projectInvolvements.length > 0) {
        member.projectInvolvements.forEach(inv => projectIds.add(inv.projectId));
      }
      
      if (member.projects && member.projects.length > 0) {
        member.projects.forEach(id => projectIds.add(id));
      }
      
      // Fetch all projects in parallel
      try {
        const projectPromises = Array.from(projectIds).map(async (id) => {
          try {
            const project = await getProject(id);
            return [id, project];
          } catch (error) {
            console.error(`Failed to fetch project ${id}:`, error);
            return [id, null];
          }
        });
        
        const projectEntries = await Promise.all(projectPromises);
        const projectMap = Object.fromEntries(projectEntries);
        
        setProjectsData(projectMap);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [member.projectInvolvements, member.projects]);
  
  if (isLoading) {
    return (
      <div>
        <p className="mb-1 text-sm font-medium">Projects</p>
        <div className="text-sm text-muted-foreground">Loading projects...</div>
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
        {(Object.keys(projectsData).length === 0 && 
         ((member.projectInvolvements && member.projectInvolvements.length > 0) || 
          (member.projects && member.projects.length > 0))) && (
          <p className="text-sm text-muted-foreground">Unable to load project data</p>
        )}
      </div>
    </div>
  );
}
