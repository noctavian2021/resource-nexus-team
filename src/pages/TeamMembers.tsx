
import React, { useState, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import TeamList from '@/components/Team/TeamList';
import SendWelcomeDialog from '@/components/Team/SendWelcomeDialog';
import AddTeamMemberDialog from '@/components/Team/AddTeamMemberDialog';
import { getTeamMembers } from '@/services/teamService';
import { TeamMember } from '@/data/mockData';

export default function TeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch team members whenever the component mounts
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const data = await getTeamMembers();
        setTeamMembers(data);
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  return (
    <>
      <Header title="Team Members" />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Team Members</h1>
          <div className="flex gap-2">
            <SendWelcomeDialog />
            <AddTeamMemberDialog />
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
