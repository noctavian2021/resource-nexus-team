
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TeamMember, getProjectById } from '@/data/mockData';
import { Calendar } from 'lucide-react';

interface TeamMemberCardProps {
  member: TeamMember;
}

export default function TeamMemberCard({ member }: TeamMemberCardProps) {
  // Get day names for office days
  const getOfficeDays = () => {
    if (!member.officeDays) return "Not specified";
    
    const days = [];
    if (member.officeDays.monday) days.push("Mon");
    if (member.officeDays.tuesday) days.push("Tue");
    if (member.officeDays.wednesday) days.push("Wed");
    if (member.officeDays.thursday) days.push("Thu");
    if (member.officeDays.friday) days.push("Fri");
    
    return days.length > 0 ? days.join(", ") : "Remote";
  };
  
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
        
        {member.requiredResources && member.requiredResources.length > 0 && (
          <div>
            <p className="mb-1 text-sm font-medium">Required Resources</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              {member.requiredResources.slice(0, 3).map((resource, index) => (
                <p key={index}>{resource.name} ({resource.type})</p>
              ))}
              {member.requiredResources.length > 3 && (
                <p className="text-xs">+{member.requiredResources.length - 3} more</p>
              )}
            </div>
          </div>
        )}
        
        {member.officeDays && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Office: {getOfficeDays()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
