
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import TeamList from '@/components/Team/TeamList';
import { getTeamMembersByDepartment } from '@/services/teamService';
import { getDepartmentById } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { TeamMember } from '@/data/mockData';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DepartmentDetail() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { departmentId } = useParams<{departmentId: string}>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const department = departmentId ? getDepartmentById(departmentId) : undefined;
  
  useEffect(() => {
    if (!department) {
      toast({
        title: "Department not found",
        description: "The requested department could not be found.",
        variant: "destructive",
      });
      navigate("/departments");
      return;
    }
    
    const fetchTeamMembers = async () => {
      try {
        const data = await getTeamMembersByDepartment(department.name);
        setTeamMembers(data);
      } catch (error) {
        console.error('Error fetching team members:', error);
        toast({
          title: "Error",
          description: "Failed to fetch team members for this department.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [department, departmentId, navigate, toast]);

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
          <h2 className="text-xl font-medium mb-4">Team Members</h2>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-muted-foreground">Loading team members...</p>
            </div>
          ) : (
            teamMembers.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
                <p className="text-center text-muted-foreground">
                  No team members found in this department.
                </p>
              </div>
            ) : (
              <TeamList teamMembers={teamMembers} />
            )
          )}
        </div>
      </main>
    </>
  );
}
