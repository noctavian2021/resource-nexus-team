
import React, { useState, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import ProjectList from '@/components/Projects/ProjectList';
import AddProjectDialog from '@/components/Projects/AddProjectDialog';
import { getProjects } from '@/services/projectService';
import { Project } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching projects...");
      const data = await getProjects();
      console.log("Projects fetched:", data);
      
      // Ensure we're working with an array
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('There was a problem loading the projects.');
      toast({
        title: "Error loading projects",
        description: "There was a problem loading the projects. Please try again.",
        variant: "destructive"
      });
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectUpdated = () => {
    fetchProjects();
  };

  return (
    <>
      <Header title="Projects" />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <AddProjectDialog onProjectAdded={handleProjectUpdated} />
        </div>
        
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading projects...</span>
          </div>
        ) : error ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-destructive/50 p-8 text-center">
            <p className="text-destructive">{error}</p>
            <button 
              onClick={fetchProjects} 
              className="mt-4 text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <ProjectList 
            projects={projects} 
            onProjectUpdated={handleProjectUpdated} 
          />
        )}
      </main>
    </>
  );
}
