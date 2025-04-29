
import React from 'react';
import { TeamMember } from '@/data/mockData';

interface VacationStatusProps {
  vacation?: TeamMember['vacation'];
}

export default function VacationStatus({ vacation }: VacationStatusProps) {
  if (!vacation) return null;
  
  // Format dates to display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (vacation.isOnVacation) {
    return (
      <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-800/30">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">Currently on vacation</p>
        <p className="text-xs text-red-500 dark:text-red-300">
          {formatDate(vacation.startDate)} - {formatDate(vacation.endDate)}
        </p>
      </div>
    );
  }

  if (vacation.startDate) {
    return (
      <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-100 dark:border-amber-800/30">
        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Upcoming vacation</p>
        <p className="text-xs text-amber-500 dark:text-amber-300">
          {formatDate(vacation.startDate)} - {formatDate(vacation.endDate)}
        </p>
      </div>
    );
  }

  return null;
}
