
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TeamMember } from '@/data/mockData';
import TeamMemberHeader from './TeamMemberHeader';
import VacationStatus from './VacationStatus';
import AvailabilityIndicator from './AvailabilityIndicator';
import MemberSkills from './MemberSkills';
import ProjectInvolvements from './ProjectInvolvements';
import RequiredResources from './RequiredResources';
import OfficeDays from './OfficeDays';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TeamMemberCardProps {
  member: TeamMember;
  onMemberUpdated: (updatedMember: TeamMember) => void;
  onRemove?: () => void;
}

export default function TeamMemberCard({ member, onMemberUpdated, onRemove }: TeamMemberCardProps) {
  return (
    <Card className="overflow-hidden">
      <TeamMemberHeader 
        member={member} 
        onMemberUpdated={onMemberUpdated}
        rightElement={
          onRemove && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onRemove}
              title="Remove member"
            >
              <X className="h-4 w-4" />
            </Button>
          )
        } 
      />
      <CardContent className="space-y-3">
        <VacationStatus vacation={member.vacation} />
        <AvailabilityIndicator availability={member.availability} />
        
        <div className="space-y-1">
          <p className="text-sm font-medium">Department</p>
          <p className="text-sm text-muted-foreground">{member.department}</p>
        </div>
        
        <MemberSkills skills={member.skills} />
        <ProjectInvolvements member={member} />
        <RequiredResources requiredResources={member.requiredResources} />
        <OfficeDays officeDays={member.officeDays} />
      </CardContent>
    </Card>
  );
}
