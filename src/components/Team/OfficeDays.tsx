
import React from 'react';
import { Calendar } from 'lucide-react';
import { TeamMember } from '@/data/mockData';

interface OfficeDaysProps {
  officeDays?: TeamMember['officeDays'];
}

export default function OfficeDays({ officeDays }: OfficeDaysProps) {
  if (!officeDays) return null;
  
  // Get day names for office days
  const getOfficeDays = () => {
    const days = [];
    if (officeDays.monday) days.push("Mon");
    if (officeDays.tuesday) days.push("Tue");
    if (officeDays.wednesday) days.push("Wed");
    if (officeDays.thursday) days.push("Thu");
    if (officeDays.friday) days.push("Fri");
    
    return days.length > 0 ? days.join(", ") : "Remote";
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <span className="text-muted-foreground">Office: {getOfficeDays()}</span>
    </div>
  );
}
