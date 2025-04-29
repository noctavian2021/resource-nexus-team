
import React from 'react';
import { TeamMember } from '@/data/mockData';

interface RequiredResourcesProps {
  requiredResources?: TeamMember['requiredResources'];
}

export default function RequiredResources({ requiredResources }: RequiredResourcesProps) {
  if (!requiredResources || requiredResources.length === 0) return null;
  
  return (
    <div>
      <p className="mb-1 text-sm font-medium">Required Resources</p>
      <div className="space-y-1 text-sm text-muted-foreground">
        {requiredResources.slice(0, 3).map((resource, index) => (
          <p key={index}>{resource.name} ({resource.type})</p>
        ))}
        {requiredResources.length > 3 && (
          <p className="text-xs">+{requiredResources.length - 3} more</p>
        )}
      </div>
    </div>
  );
}
