
import React from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Layout/Header';
import TeamList from '@/components/Team/TeamList';
import { teamMembers } from '@/data/mockData';
import SendWelcomeDialog from '@/components/Team/SendWelcomeDialog';
import AddTeamMemberDialog from '@/components/Team/AddTeamMemberDialog';

export default function TeamMembers() {
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
        
        <TeamList teamMembers={teamMembers} />
      </main>
    </>
  );
}
