
import React from 'react';
import { CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FileEdit } from 'lucide-react';
import { TeamMember } from '@/data/mockData';
import EditTeamMemberDialog from './EditTeamMemberDialog';

interface TeamMemberHeaderProps {
  member: TeamMember;
  onMemberUpdated: (updatedMember: TeamMember) => void;
  rightElement?: React.ReactNode;
}

export default function TeamMemberHeader({ member, onMemberUpdated, rightElement }: TeamMemberHeaderProps) {
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <div className="flex items-center space-x-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src={member.avatar} />
          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium leading-none mb-1">{member.name}</div>
          <div className="text-sm text-muted-foreground">{member.role}</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {rightElement}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowEditDialog(true)} 
          className="text-muted-foreground hover:text-foreground"
          aria-label="Edit team member"
          title="Edit team member"
        >
          <FileEdit className="h-4 w-4" />
        </Button>
      </div>
      <EditTeamMemberDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        member={member}
        onMemberUpdated={onMemberUpdated}
      />
    </CardHeader>
  );
}
