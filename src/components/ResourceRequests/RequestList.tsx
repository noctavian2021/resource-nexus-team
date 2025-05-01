
import React from 'react';
import RequestCard from './RequestCard';
import { ResourceRequest } from '@/data/mockData';

interface RequestListProps {
  requests: ResourceRequest[];
  currentDepartmentId?: string;
  showAll?: boolean;
}

export default function RequestList({ 
  requests, 
  currentDepartmentId,
  showAll = false
}: RequestListProps) {
  // Filter requests based on the current department
  const filteredRequests = React.useMemo(() => {
    if (showAll || !currentDepartmentId) {
      return requests;
    }
    
    // Show requests where:
    // 1. The current department is the requesting department (outgoing requests)
    // 2. The current department is the target department (incoming requests)
    return requests.filter(request => 
      request.requestingDepartmentId === currentDepartmentId || 
      request.targetDepartmentId === currentDepartmentId
    );
  }, [requests, currentDepartmentId, showAll]);

  if (filteredRequests.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No resource requests found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredRequests.map((request) => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}
