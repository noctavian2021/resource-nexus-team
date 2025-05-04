
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TeamMember } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import TeamMemberPasswordActions from '@/components/Admin/TeamMemberPasswordActions';

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, onEdit }) => {
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

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              {member.profileImage ? (
                <AvatarImage src={member.profileImage} alt={member.name} />
              ) : null}
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{member.name}</div>
              <div className="text-sm text-muted-foreground">{member.email}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdmin && (
              <TeamMemberPasswordActions userId={member.id} userName={member.name} />
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(member)}>
                  Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-2">
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
      </CardContent>
    </Card>
  );
};

export default TeamMemberCard;
