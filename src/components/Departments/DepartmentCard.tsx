
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Department, getTeamMemberById } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Users, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { hideDepartment } from '@/services/departmentService';
import { useToast } from '@/hooks/use-toast';
import EditDepartmentDialog from './EditDepartmentDialog';
import DeleteDepartmentDialog from './DeleteDepartmentDialog';

interface DepartmentCardProps {
  department: Department;
  onDepartmentUpdated: () => void;
}

export default function DepartmentCard({ department, onDepartmentUpdated }: DepartmentCardProps) {
  const lead = getTeamMemberById(department.leadId);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleDepartmentClick = () => {
    navigate(`/departments/${department.id}`);
  };

  const handleMembersClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    navigate(`/departments/${department.id}`);
  };

  const toggleVisibility = async () => {
    setIsProcessing(true);
    try {
      const newIsHidden = !department.isHidden;
      await hideDepartment(department.id, newIsHidden);
      
      toast({
        title: newIsHidden ? "Department hidden" : "Department visible",
        description: `${department.name} is now ${newIsHidden ? 'hidden' : 'visible'}.`,
      });
      
      onDepartmentUpdated();
    } catch (error) {
      console.error('Error toggling department visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update department visibility.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card 
      className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${department.isHidden ? 'opacity-60' : ''}`}
      onClick={handleDepartmentClick}
    >
      <div className="h-2" style={{ backgroundColor: department.color }}></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{department.name}</CardTitle>
          <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility();
              }}
              disabled={isProcessing}
            >
              {department.isHidden ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              <span className="sr-only">
                {department.isHidden ? 'Show' : 'Hide'}
              </span>
            </Button>
            <EditDepartmentDialog 
              department={department}
              onDepartmentUpdated={onDepartmentUpdated}
            />
            <DeleteDepartmentDialog
              departmentId={department.id}
              departmentName={department.name}
              onDepartmentDeleted={onDepartmentUpdated}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{department.description}</p>
        
        <div className="space-y-1">
          <p className="text-sm font-medium">Department Lead</p>
          <div className="flex items-center gap-2">
            <img
              src={lead?.avatar || 'https://i.pravatar.cc/150'}
              alt={lead?.name || 'Department Lead'}
              className="h-8 w-8 rounded-full object-cover"
            />
            <p className="text-sm">{lead?.name || 'Unassigned'}</p>
          </div>
        </div>
        
        <div 
          className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded cursor-pointer"
          onClick={handleMembersClick}
        >
          <Users className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm">
            <span className="font-medium">{department.memberCount}</span>
            <span className="text-muted-foreground"> members</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
