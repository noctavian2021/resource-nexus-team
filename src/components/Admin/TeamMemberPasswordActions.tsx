
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import ResetPasswordDialog from './ResetPasswordDialog';
import { Lock } from 'lucide-react';

type TeamMemberPasswordActionsProps = {
  userId: string;
  userName: string;
};

const TeamMemberPasswordActions: React.FC<TeamMemberPasswordActionsProps> = ({
  userId,
  userName,
}) => {
  const { user } = useAuth();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // Only show for admins and don't show for the admin's own account
  if (!user || user.role !== 'admin' || user.id === userId) {
    return null;
  }

  console.log(`Rendering password reset action for user: ${userName} (ID: ${userId})`);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          console.log(`Opening reset dialog for user: ${userName} (ID: ${userId})`);
          setIsResetDialogOpen(true);
        }}
        className="flex items-center gap-1 w-full"
      >
        <Lock className="h-4 w-4 mr-1" />
        <span>Reset Password</span>
      </Button>
      
      <ResetPasswordDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        userId={userId}
        userName={userName}
      />
    </>
  );
};

export default TeamMemberPasswordActions;
