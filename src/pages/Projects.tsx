
import React from 'react';
import Header from '@/components/Layout/Header';
import ProjectList from '@/components/Projects/ProjectList';
import { projects } from '@/data/mockData';
import AddProjectDialog from '@/components/Projects/AddProjectDialog';

export default function Projects() {
  return (
    <>
      <Header title="Projects" />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <AddProjectDialog />
        </div>
        
        <ProjectList projects={projects} />
      </main>
    </>
  );
}
