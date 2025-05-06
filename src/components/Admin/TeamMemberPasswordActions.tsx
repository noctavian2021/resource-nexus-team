
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

  const handleOpenResetDialog = () => {
    console.log(`Opening reset dialog for user ID: ${userId}, name: ${userName}`);
    setIsResetDialogOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenResetDialog}
        className="flex items-center gap-1 w-full"
      >
        <Lock className="h-4 w-4 mr-1" />
        <span>Reset Password</span>
      </Button>
      
      {isResetDialogOpen && (
        <ResetPasswordDialog
          isOpen={isResetDialogOpen}
          onClose={() => setIsResetDialogOpen(false)}
          userId={userId}
          userName={userName}
        />
      )}
    </>
  );
};

export default TeamMemberPasswordActions;
