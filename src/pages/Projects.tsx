
import React, { useState, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import ProjectList from '@/components/Projects/ProjectList';
import AddProjectDialog from '@/components/Projects/AddProjectDialog';
import { getProjects } from '@/services/projectService';
import { Project } from '@/data/mockData';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <>
      <Header title="Projects" />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <AddProjectDialog />
        </div>
        
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        ) : (
          <ProjectList projects={projects} />
        )}
      </main>
    </>
  );
}
