
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
  // Find the executive department if it exists
  const executiveDept = departments.find(dept => 
    dept.name.toLowerCase() === 'executive' || dept.name.toLowerCase().includes('executive')
  );
  
  // Get executive team members
  const executiveMembers = executiveDept 
    ? teamMembers.filter(member => member.department === executiveDept.name)
    : [];
  
  // Get the executive lead if available
  const executiveLead = executiveDept && executiveDept.leadId
    ? teamMembers.find(m => m.id === executiveDept.leadId) 
    : null;

  // Filter out executive department from other departments
  const otherDepartments = departments.filter(dept => 
    dept.id !== (executiveDept?.id ?? '')
  );

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
            {/* Executive Department - Top Level */}
            {executiveDept && (
              <TreeNode 
                label={`${executiveDept.name} Department`}
                icon={<Building className="h-4 w-4" />}
                color={executiveDept.color}
                defaultExpanded={true}
              >
                {/* Executive Lead */}
                {executiveLead && (
                  <TreeNode
                    label={executiveLead.name}
                    icon={<User className="h-4 w-4" />}
                    avatar={executiveLead.avatar}
                    role={`${executiveLead.role} (Lead)`}
                    email={executiveLead.email}
                    badges={["Lead"]}
                  />
                )}
                
                {/* Executive Members */}
                {executiveMembers
                  .filter(m => m.id !== executiveLead?.id)
                  .map((member) => (
                    <TreeNode
                      key={member.id}
                      label={member.name}
                      icon={<User className="h-4 w-4" />}
                      avatar={member.avatar}
                      role={member.role}
                      email={member.email}
                    />
                  ))
                }
              </TreeNode>
            )}
            
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
            
            {/* Departments - Vertical Layout with better spacing */}
            <TreeNode 
              label="Departments" 
              icon={<Building className="h-4 w-4" />} 
              defaultExpanded={true}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pr-2">
                {otherDepartments.map((department) => {
                  const lead = teamMembers.find(m => m.id === department.leadId);
                  const deptMembers = teamMembers.filter(
                    m => m.department === department.name && (!lead || m.id !== lead.id)
                  );
                  
                  return (
                    <div key={department.id} className="border rounded-md p-2 bg-background/80">
                      <TreeNode
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
                    </div>
                  );
                })}
              </div>
            </TreeNode>
          </TreeNode>
        </div>
      </CardContent>
    </Card>
  );
}
