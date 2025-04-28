
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TeamMember, getProjectById } from '@/data/mockData';

interface TeamMemberCardProps {
  member: TeamMember;
}

export default function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <img
            src={member.avatar}
            alt={member.name}
            className="h-14 w-14 rounded-full object-cover"
          />
          <div>
            <CardTitle className="text-lg">{member.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{member.role}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium">Availability</span>
            <span className="text-sm text-muted-foreground">{member.availability}%</span>
          </div>
          <Progress value={member.availability} className="h-2" />
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium">Department</p>
          <p className="text-sm text-muted-foreground">{member.department}</p>
        </div>
        
        <div>
          <p className="mb-1 text-sm font-medium">Skills</p>
          <div className="flex flex-wrap gap-1">
            {member.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <p className="mb-1 text-sm font-medium">Projects</p>
          <div className="space-y-1">
            {member.projects.map((projectId) => {
              const project = getProjectById(projectId);
              return project ? (
                <p key={projectId} className="text-sm text-muted-foreground">
                  {project.name}
                </p>
              ) : null;
            })}
            {member.projects.length === 0 && (
              <p className="text-sm text-muted-foreground">No active projects</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
