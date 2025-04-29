
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Department, getTeamMemberById } from '@/data/mockData';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DepartmentCardProps {
  department: Department;
}

export default function DepartmentCard({ department }: DepartmentCardProps) {
  const lead = getTeamMemberById(department.leadId);
  const navigate = useNavigate();

  const handleDepartmentClick = () => {
    navigate(`/departments/${department.id}`);
  };

  const handleMembersClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    navigate(`/departments/${department.id}`);
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleDepartmentClick}
    >
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
        
        <div 
          className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded cursor-pointer"
          onClick={handleMembersClick}
        >
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
