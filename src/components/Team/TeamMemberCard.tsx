
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Lock } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TeamMember } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import TeamMemberPasswordActions from '@/components/Admin/TeamMemberPasswordActions';
import EditTeamMemberDialog from './EditTeamMemberDialog';

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onMemberUpdated?: (member: TeamMember) => void;
  onRemove?: () => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ 
  member, 
  onEdit, 
  onMemberUpdated,
  onRemove 
}) => {
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  
  // Extract initials from name for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user to check if current user is admin
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Handler for opening edit dialog
  const handleShowEditDialog = () => {
    setShowEditDialog(true);
  };
  
  // Handler for when a member is updated through the dialog
  const handleMemberUpdated = (updatedMember: TeamMember) => {
    if (onMemberUpdated) {
      onMemberUpdated(updatedMember);
    }
    onEdit(updatedMember);
  };

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              {member.avatar ? (
                <AvatarImage src={member.avatar} alt={member.name} />
              ) : null}
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{member.name}</div>
              <div className="text-sm text-muted-foreground">{member.email}</div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShowEditDialog}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {onRemove && (
                <DropdownMenuItem onClick={onRemove} className="text-destructive">
                  Remove
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant={member.status === 'active' ? 'default' : 'outline'}>
            {member.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
          
          <Badge variant="outline">
            {member.department}
          </Badge>
          
          <Badge variant="secondary">
            {member.role}
          </Badge>
        </div>
        
        {isAdmin && user.id !== member.id && (
          <div className="mt-3">
            <TeamMemberPasswordActions userId={member.id} userName={member.name} />
          </div>
        )}
      </CardContent>
      
      <EditTeamMemberDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        member={member}
        onMemberUpdated={handleMemberUpdated}
      />
    </Card>
  );
};

export default TeamMemberCard;
