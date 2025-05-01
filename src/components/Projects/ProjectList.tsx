
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import ProjectCard from './ProjectCard';
import { Project } from '@/data/mockData';

interface ProjectListProps {
  projects: Project[];
  onProjectUpdated: () => void;
}

export default function ProjectList({ projects, onProjectUpdated }: ProjectListProps) {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showHidden, setShowHidden] = useState(false);
  
  // Ensure projects is an array
  const projectsArray = Array.isArray(projects) ? projects : [];
  
  const filteredProjects = projectsArray.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase()) ||
                        project.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || 
                        project.status.toLowerCase() === selectedStatus.toLowerCase();
    
    // Only show hidden projects if the toggle is on
    const matchesVisibility = showHidden || !project.isHidden;
    
    return matchesSearch && matchesStatus && matchesVisibility;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-4">
          <div className="w-full md:w-[200px]">
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="on hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-hidden" 
              checked={showHidden}
              onCheckedChange={setShowHidden}
            />
            <Label htmlFor="show-hidden">Show Hidden</Label>
          </div>
        </div>
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-center text-muted-foreground">
            No projects found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onProjectUpdated={onProjectUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
