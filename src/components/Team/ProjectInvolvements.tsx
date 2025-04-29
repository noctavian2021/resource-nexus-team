
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TeamMember, getProjectById } from '@/data/mockData';

interface ProjectInvolvementsProps {
  member: TeamMember;
}

export default function ProjectInvolvements({ member }: ProjectInvolvementsProps) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium">Projects</p>
      <div className="space-y-1">
        {member.projectInvolvements ? (
          member.projectInvolvements.map((involvement, index) => {
            const project = getProjectById(involvement.projectId);
            return project ? (
              <div key={index} className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {project.name}
                </p>
                <Badge variant="outline">{involvement.percentage}%</Badge>
              </div>
            ) : null;
          })
        ) : member.projects && member.projects.length > 0 ? (
          member.projects.map((projectId) => {
            const project = getProjectById(projectId);
            return project ? (
              <p key={projectId} className="text-sm text-muted-foreground">
                {project.name}
              </p>
            ) : null;
          })
        ) : (
          <p className="text-sm text-muted-foreground">No active projects</p>
        )}
      </div>
    </div>
  );
}
