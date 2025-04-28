
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Department, getTeamMemberById } from '@/data/mockData';
import { Users } from 'lucide-react';

interface DepartmentCardProps {
  department: Department;
}

export default function DepartmentCard({ department }: DepartmentCardProps) {
  const lead = getTeamMemberById(department.leadId);

  return (
    <Card className="overflow-hidden">
      <div className="h-2" style={{ backgroundColor: department.color }}></div>
      <CardHeader className="pb-2">
        <CardTitle>{department.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{department.description}</p>
        
        <div className="space-y-1">
          <p className="text-sm font-medium">Department Lead</p>
          <div className="flex items-center gap-2">
            <img
              src={lead?.avatar || 'https://i.pravatar.cc/150'}
              alt={lead?.name || 'Department Lead'}
              className="h-8 w-8 rounded-full object-cover"
            />
            <p className="text-sm">{lead?.name || 'Unassigned'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm">
            <span className="font-medium">{department.memberCount}</span>
            <span className="text-muted-foreground"> members</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
