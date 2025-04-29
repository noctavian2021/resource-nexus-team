
import React, { useState, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import TeamList from '@/components/Team/TeamList';
import SendWelcomeDialog from '@/components/Team/SendWelcomeDialog';
import AddTeamMemberDialog from '@/components/Team/AddTeamMemberDialog';
import { getTeamMembers } from '@/services/teamService';
import { TeamMember } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { toast } from '@/hooks/use-toast';

export default function TeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch team members whenever the component mounts
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const data = await getTeamMembers();
        setTeamMembers(data);
      } catch (error) {
        console.error('Error fetching team members:', error);
        toast({
          title: "Error",
          description: "Failed to fetch team members. Using mock data instead.",
          variant: "destructive"
        });
        
        // Initialize with empty array if fetch fails
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [toast]);

  const handleMemberAdded = (newMember: TeamMember) => {
    toast({
      title: "Success",
      description: `${newMember.name} has been added to the team.`,
    });
    setTeamMembers(prev => [...prev, newMember]);
  };

  return (
    <>
      <Header title="Team Members" />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Team Members</h1>
          <div className="flex gap-2">
            <SendWelcomeDialog />
            <AddTeamMemberDialog onMemberAdded={handleMemberAdded} />
          </div>
        </div>
        
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground">Loading team members...</p>
          </div>
        ) : (
          <TeamList teamMembers={teamMembers} />
        )}
      </main>
    </>
  );
}
