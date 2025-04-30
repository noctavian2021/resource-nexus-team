
import React, { useState } from 'react';
import { TeamMember, Department } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  User, 
  Building 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OrgTreeViewProps {
  directors: TeamMember[];
  departments: Department[];
  teamMembers: TeamMember[];
}

const TreeNode = ({ 
  label, 
  icon, 
  color, 
  children, 
  defaultExpanded = true,
  avatar,
  role,
  email,
  badges,
}: { 
  label: string;
  icon: React.ReactNode;
  color?: string;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  avatar?: string;
  role?: string;
  email?: string;
  badges?: string[];
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="ml-4 mt-1">
      <div className="flex items-start">
        <button 
          className="mr-1 p-1 hover:bg-secondary/30 rounded-sm transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          {children ? (
            expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : <span className="w-4" />}
        </button>
        
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center gap-2">
            <div 
              className={cn(
                "flex items-center justify-center rounded-sm p-1",
                color ? "" : "bg-primary/10"
              )}
              style={color ? { backgroundColor: color } : {}}
            >
              {icon}
            </div>
            
            {avatar ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={avatar} alt={label} />
                  <AvatarFallback>{label.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{label}</span>
                  {role && <span className="text-xs text-muted-foreground">{role}</span>}
                </div>
              </div>
            ) : (
              <span className="font-medium">{label}</span>
            )}
            
            {badges && badges.length > 0 && (
              <div className="flex gap-1">
                {badges.map((badge, i) => (
                  <Badge key={i} variant="outline" className="bg-primary/10 text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {email && (
            <span className="text-xs text-muted-foreground pl-7">{email}</span>
          )}
        </div>
      </div>
      
      {expanded && children && (
        <div className="border-l-2 border-border pl-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default function OrgTreeView({ directors, departments, teamMembers }: OrgTreeViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Organization Tree
        </CardTitle>
        <CardDescription>
          Hierarchical view of the organization structure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-secondary/10 rounded-md p-3">
          <TreeNode 
            label="Organization" 
            icon={<Building className="h-4 w-4" />} 
            defaultExpanded={true}
          >
            {/* Directors */}
            {directors.length > 0 && (
              <TreeNode 
                label="Directors" 
                icon={<Users className="h-4 w-4" />} 
                defaultExpanded={true}
              >
                {directors.map((director) => (
                  <TreeNode
                    key={director.id}
                    label={director.name}
                    icon={<User className="h-4 w-4" />}
                    avatar={director.avatar}
                    role={director.role}
                    email={director.email}
                  />
                ))}
              </TreeNode>
            )}
            
            {/* Departments */}
            {departments.map((department) => {
              const lead = teamMembers.find(m => m.id === department.leadId);
              const deptMembers = teamMembers.filter(
                m => m.department === department.name && (!lead || m.id !== lead.id)
              );
              
              return (
                <TreeNode
                  key={department.id}
                  label={department.name}
                  icon={<Building className="h-4 w-4" />}
                  color={department.color}
                  defaultExpanded={true}
                >
                  {/* Department Lead */}
                  {lead && (
                    <TreeNode
                      label={lead.name}
                      icon={<User className="h-4 w-4" />}
                      avatar={lead.avatar}
                      role={`${lead.role} (Lead)`}
                      email={lead.email}
                      badges={["Lead"]}
                    />
                  )}
                  
                  {/* Department Members */}
                  {deptMembers.map((member) => (
                    <TreeNode
                      key={member.id}
                      label={member.name}
                      icon={<User className="h-4 w-4" />}
                      avatar={member.avatar}
                      role={member.role}
                      email={member.email}
                    />
                  ))}
                </TreeNode>
              );
            })}
          </TreeNode>
        </div>
      </CardContent>
    </Card>
  );
}
