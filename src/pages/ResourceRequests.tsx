
import React from 'react';
import Header from '@/components/Layout/Header';
import RequestList from '@/components/ResourceRequests/RequestList';
import { resourceRequests } from '@/data/mockData';
import CreateRequestDialog from '@/components/ResourceRequests/CreateRequestDialog';

export default function ResourceRequests() {
  return (
    <>
      <Header title="Resource Requests" />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Resource Requests</h1>
          <CreateRequestDialog />
        </div>
        
        <RequestList requests={resourceRequests} />
      </main>
    </>
  );
}
