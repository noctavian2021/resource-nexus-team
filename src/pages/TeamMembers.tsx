
import React, { useState, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import TeamList from '@/components/Team/TeamList';
import SendWelcomeDialog from '@/components/Team/SendWelcomeDialog';
import AddTeamMemberDialog from '@/components/Team/AddTeamMemberDialog';
import { getTeamMembers } from '@/services/teamService';
import { TeamMember } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function TeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch team members whenever the component mounts
  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchTeamMembers();
  }, [toast]);

  const handleMemberAdded = (newMember: TeamMember) => {
    // Show appropriate toast based on role
    if (newMember.role === 'Director') {
      toast({
        title: "Success",
        description: `${newMember.name} has been added as a Director with full access.`,
      });
    } else {
      toast({
        title: "Success",
        description: `${newMember.name} has been added to the team.`,
      });
    }
    
    setTeamMembers(prev => [...prev, newMember]);
  };

  const handleMemberUpdated = (updatedMember: TeamMember) => {
    setTeamMembers(prev => 
      prev.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      )
    );
  };

  return (
    <>
      <Header title="Team Members" />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Team Members</h1>
          <div className="flex gap-2">
            <SendWelcomeDialog 
              teamMembers={teamMembers} 
              onRefreshList={fetchTeamMembers}
            />
            <AddTeamMemberDialog onMemberAdded={handleMemberAdded} />
          </div>
        </div>
        
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground">Loading team members...</p>
          </div>
        ) : (
          <TeamList 
            teamMembers={teamMembers} 
            onMemberUpdated={handleMemberUpdated} 
          />
        )}
      </main>
    </>
  );
}
