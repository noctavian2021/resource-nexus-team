
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResourceRequest, getDepartmentById } from '@/data/mockData';
import { CalendarDays, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Approved':
      return <Badge className="bg-green-500">Approved</Badge>;
    case 'Declined':
      return <Badge className="bg-red-500">Declined</Badge>;
    case 'Pending':
    case 'pending':
      return <Badge variant="outline">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

interface RequestCardProps {
  request: ResourceRequest;
}

export default function RequestCard({ request }: RequestCardProps) {
  const { toast } = useToast();
  const requestingDepartment = getDepartmentById(request.requestingDepartmentId);
  const targetDepartment = getDepartmentById(request.targetDepartmentId);

  const handleApprove = () => {
    // In a real app, this would be an API call
    console.log('Approved request:', request.id);
    toast({
      title: "Request Approved",
      description: "The resource request has been approved successfully.",
    });
  };

  const handleDecline = () => {
    // In a real app, this would be an API call
    console.log('Declined request:', request.id);
    toast({
      description: "The resource request has been declined.",
      variant: "destructive",
    });
  };

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
      
      {request.status === "pending" && (
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            <X className="mr-1 h-4 w-4" />
            Decline
          </Button>
          <Button size="sm" onClick={handleApprove}>
            <Check className="mr-1 h-4 w-4" />
            Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
