
import React from 'react';
import { Project, departments, getTeamMemberById } from '@/data/mockData';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProjectActions from './ProjectActions';

interface ProjectCardProps {
  project: Project;
  onProjectUpdated?: () => void;
}

export default function ProjectCard({ project, onProjectUpdated = () => {} }: ProjectCardProps) {
  // Don't render if project is hidden
  if (project.isHidden) return null;

  const department = departments.find(d => d.id === project.departmentId);
  
  const startDate = new Date(project.startDate).toLocaleDateString();
  const endDate = new Date(project.endDate).toLocaleDateString();
  
  // Get status color
  const getStatusColor = () => {
    switch (project.status) {
      case 'Active': return 'bg-green-500';
      case 'Planning': return 'bg-blue-500';
      case 'Completed': return 'bg-gray-500';
      case 'On Hold': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Get priority color
  const getPriorityClass = () => {
    switch (project.priority) {
      case 'Low': return 'bg-slate-200 text-slate-700';
      case 'Medium': return 'bg-blue-200 text-blue-700';
      case 'High': return 'bg-orange-200 text-orange-700';
      case 'Urgent': return 'bg-red-200 text-red-700';
      default: return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md">
      <ProjectActions project={project} onProjectUpdated={onProjectUpdated} />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{project.name}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={`inline-block h-2 w-2 rounded-full ${getStatusColor()}`}></span>
          {project.status}
          <span className="mx-1">•</span>
          <Badge variant="outline" className={getPriorityClass()}>
            {project.priority}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-1" />
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <div>
            <p className="font-medium">Start Date</p>
            <p>{startDate}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">End Date</p>
            <p>{endDate}</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground">Department</p>
          {department && (
            <Badge 
              variant="outline" 
              style={{ backgroundColor: `${department.color}20`, borderColor: department.color }}
              className="w-fit text-xs"
            >
              {department.name}
            </Badge>
          )}
        </div>
        
        {project.teamMembers.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground">Team</p>
            <div className="flex -space-x-2">
              {project.teamMembers.slice(0, 3).map(memberId => {
                const member = getTeamMemberById(memberId);
                return member ? (
                  <Avatar key={memberId} className="border-2 border-background h-7 w-7">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ) : null;
              })}
              {project.teamMembers.length > 3 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                  +{project.teamMembers.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
