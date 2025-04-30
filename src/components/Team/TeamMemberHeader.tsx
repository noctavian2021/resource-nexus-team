
import React from 'react';
import { CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FileEdit, UserX } from 'lucide-react';
import { TeamMember } from '@/data/mockData';
import EditTeamMemberDialog from './EditTeamMemberDialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateTeamMember } from '@/services/teamService';
import { useToast } from '@/hooks/use-toast';

interface TeamMemberHeaderProps {
  member: TeamMember;
  onMemberUpdated: (updatedMember: TeamMember) => void;
  rightElement?: React.ReactNode;
}

export default function TeamMemberHeader({ member, onMemberUpdated, rightElement }: TeamMemberHeaderProps) {
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showDisableDialog, setShowDisableDialog] = React.useState(false);
  const [isDisabling, setIsDisabling] = React.useState(false);
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleDisableMember = async () => {
    setIsDisabling(true);
    try {
      // Update the team member's status to "disabled"
      const updatedMember = {
        ...member,
        status: 'disabled' as const,
        availability: 0 // Set availability to 0 when disabled
      };
      
      await updateTeamMember(member.id, { status: 'disabled' as const, availability: 0 });
      onMemberUpdated(updatedMember);
      
      toast({
        title: "Team member disabled",
        description: `${member.name} has been disabled successfully.`
      });
    } catch (error) {
      console.error('Error disabling team member:', error);
      toast({
        title: "Error",
        description: "Failed to disable team member. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDisabling(false);
      setShowDisableDialog(false);
    }
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
      <div className="flex flex-col items-end space-y-2">
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
        <Button 
          variant="outline" 
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          aria-label="Disable team member"
          title="Disable team member"
          onClick={() => setShowDisableDialog(true)}
          disabled={member.status === 'disabled' || isDisabling}
        >
          <UserX className="h-4 w-4 mr-1" />
          <span>{member.status === 'disabled' ? 'Disabled' : 'Disable'}</span>
        </Button>
      </div>
      <EditTeamMemberDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        member={member}
        onMemberUpdated={onMemberUpdated}
      />

      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disable {member.name}? This will mark them as inactive and set their availability to 0%.
              You can re-enable them later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDisabling}
            >
              {isDisabling ? 'Disabling...' : 'Disable'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CardHeader>
  );
}
