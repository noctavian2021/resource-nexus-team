
import React from 'react';
import RequestCard from './RequestCard';
import { ResourceRequest } from '@/data/mockData';

interface RequestListProps {
  requests: ResourceRequest[];
}

export default function RequestList({ requests }: RequestListProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {requests.map((request) => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}
