
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { TeamMember } from '@/data/mockData';
import EditTeamMemberDialog from './EditTeamMemberDialog';

interface TeamMemberHeaderProps {
  member: TeamMember;
  onMemberUpdated: (updatedMember: TeamMember) => void;
}

export default function TeamMemberHeader({ member, onMemberUpdated }: TeamMemberHeaderProps) {
  return (
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={member.avatar}
            alt={member.name}
            className="h-14 w-14 rounded-full object-cover"
          />
          <div>
            <CardTitle className="text-lg">{member.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{member.role}</p>
          </div>
        </div>
        <EditTeamMemberDialog member={member} onMemberUpdated={onMemberUpdated} />
      </div>
    </CardHeader>
  );
}
