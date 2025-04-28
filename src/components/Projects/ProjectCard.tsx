
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Project, getTeamMemberById, getDepartmentById } from '@/data/mockData';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Low':
      return 'bg-green-500';
    case 'Medium':
      return 'bg-blue-500';
    case 'High':
      return 'bg-amber-500';
    case 'Urgent':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Active':
      return <Badge className="bg-green-500">Active</Badge>;
    case 'Planning':
      return <Badge className="bg-blue-500">Planning</Badge>;
    case 'On Hold':
      return <Badge variant="outline">On Hold</Badge>;
    case 'Completed':
      return <Badge className="bg-gray-500">Completed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const department = getDepartmentById(project.departmentId);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>{project.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{department?.name || 'Unknown Department'}</p>
          </div>
          {getStatusBadge(project.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </div>
        
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-1 h-4 w-4" />
          <span>
            {format(new Date(project.startDate), 'MMM d, yyyy')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
          </span>
        </div>
        
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Priority</span>
            <div className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-full ${getPriorityColor(project.priority)}`}></div>
              <span className="text-sm">{project.priority}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {project.teamMembers.map((memberId) => {
              const member = getTeamMemberById(memberId);
              if (!member) return null;
              
              return (
                <div key={memberId} className="flex items-center gap-2">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <span className="text-sm">{member.name}</span>
                </div>
              );
            })}
            
            {project.teamMembers.length === 0 && (
              <p className="text-sm text-muted-foreground">No team members assigned</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
