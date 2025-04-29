
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface AvailabilityIndicatorProps {
  availability: number;
}

export default function AvailabilityIndicator({ availability }: AvailabilityIndicatorProps) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium">Availability</span>
        <span className="text-sm text-muted-foreground">{availability}%</span>
      </div>
      <Progress value={availability} className="h-2" />
    </div>
  );
}
