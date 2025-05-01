
import React from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Project } from '@/data/mockData';
import { hideProject, deleteProject } from '@/services/projectService';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Eye, EyeOff, Trash2 } from 'lucide-react';
import EditProjectDialog from './EditProjectDialog';

interface ProjectActionsProps {
  project: Project;
  onProjectUpdated: () => void;
}

export default function ProjectActions({ project, onProjectUpdated }: ProjectActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const { toast } = useToast();

  const handleHideToggle = async () => {
    try {
      await hideProject(project.id, !project.isHidden);
      toast({
        title: project.isHidden ? "Project shown" : "Project hidden",
        description: `${project.name} is now ${project.isHidden ? 'visible' : 'hidden'}.`,
      });
      onProjectUpdated();
    } catch (error) {
      console.error("Error toggling project visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update project visibility. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(project.id);
      toast({
        title: "Project deleted",
        description: `${project.name} has been successfully deleted.`,
      });
      onProjectUpdated();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete the project. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="absolute right-2 top-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="flex items-center gap-2">
              <EditProjectDialog project={project} onProjectUpdated={onProjectUpdated} />
              <span>Edit</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={handleHideToggle}
              className="flex items-center gap-2"
            >
              {project.isHidden ? (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Show</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Hide</span>
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
