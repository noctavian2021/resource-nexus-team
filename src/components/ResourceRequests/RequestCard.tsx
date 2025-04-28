
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResourceRequest, getDepartmentById } from '@/data/mockData';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Approved':
      return <Badge className="bg-green-500">Approved</Badge>;
    case 'Declined':
      return <Badge className="bg-red-500">Declined</Badge>;
    case 'Pending':
      return <Badge variant="outline">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

interface RequestCardProps {
  request: ResourceRequest;
}

export default function RequestCard({ request }: RequestCardProps) {
  const requestingDepartment = getDepartmentById(request.requestingDepartmentId);
  const targetDepartment = getDepartmentById(request.targetDepartmentId);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>{request.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              From: {requestingDepartment?.name} → To: {targetDepartment?.name}
            </p>
          </div>
          {getStatusBadge(request.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{request.description}</p>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Required Skills</h4>
          <div className="flex flex-wrap gap-2">
            {request.requiredSkills.map((skill) => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-1 h-4 w-4" />
          <span>
            {format(new Date(request.startDate), 'MMM d, yyyy')} - {format(new Date(request.endDate), 'MMM d, yyyy')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
