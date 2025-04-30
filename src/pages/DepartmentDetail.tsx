import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import TeamList from '@/components/Team/TeamList';
import { getTeamMembersByDepartment, deleteTeamMember } from '@/services/teamService';
import { getDepartment } from '@/services/departmentService';
import { Button } from '@/components/ui/button';
import { TeamMember, Department } from '@/data/mockData';
import { ArrowLeft, Users, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddTeamMemberDialog from '@/components/Team/AddTeamMemberDialog';
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

export default function DepartmentDetail() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const { departmentId } = useParams<{departmentId: string}>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchDepartment = async () => {
      if (!departmentId) {
        navigate("/departments");
        return;
      }
      
      try {
        const departmentData = await getDepartment(departmentId);
        setDepartment(departmentData);
        
        // Fetch team members for this department
        const teamMembersData = await getTeamMembersByDepartment(departmentData.name);
        setTeamMembers(teamMembersData);
      } catch (error) {
        console.error('Error fetching department data:', error);
        toast({
          title: "Department not found",
          description: "The requested department could not be found.",
          variant: "destructive",
        });
        navigate("/departments");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, [departmentId, navigate, toast]);

  const handleMemberAdded = (newMember: TeamMember) => {
    setTeamMembers(prev => [...prev, newMember]);
    toast({
      title: "Team member added",
      description: `${newMember.name} has been added to ${department?.name}.`,
    });
  };

  const handleMemberUpdated = (updatedMember: TeamMember) => {
    setTeamMembers(prev => 
      prev.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      )
    );
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      await deleteTeamMember(memberToRemove.id);
      
      // Remove from local state
      setTeamMembers(prev => prev.filter(member => member.id !== memberToRemove.id));
      
      toast({
        title: "Team member removed",
        description: `${memberToRemove.name} has been removed from ${department?.name}.`,
      });
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMemberToRemove(null);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Department Detail" />
        <main className="flex-1 p-6">
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Loading department data...</p>
          </div>
        </main>
      </>
    );
  }
  
  if (!department) return null;

  return (
    <>
      <Header title={`${department.name} Department`} />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/departments')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Departments
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">{department.name} Department</h1>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-muted-foreground mb-4">{department.description}</p>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {department.memberCount} team members
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({teamMembers.length})
            </h2>
            {department && (
              <AddTeamMemberDialog 
                onMemberAdded={handleMemberAdded} 
                preselectedDepartment={department.name}
              />
            )}
          </div>
          
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-muted-foreground">Loading team members...</p>
            </div>
          ) : (
            teamMembers.length === 0 ? (
              <div className="flex flex-col h-48 items-center justify-center rounded-lg border border-dashed p-8">
                <p className="text-center text-muted-foreground mb-4">
                  No team members found in this department.
                </p>
                <AddTeamMemberDialog 
                  onMemberAdded={handleMemberAdded} 
                  preselectedDepartment={department.name}
                  buttonText="Add First Team Member"
                  buttonIcon={<UserPlus className="mr-2 h-4 w-4" />}
                  buttonVariant="default"
                />
              </div>
            ) : (
              <TeamList 
                teamMembers={teamMembers} 
                onMemberUpdated={handleMemberUpdated}
                onRemoveMember={setMemberToRemove}
                allowRemove={true}
              />
            )
          )}
        </div>
      </main>

      <AlertDialog open={!!memberToRemove} onOpenChange={open => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.name} from {department?.name}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
