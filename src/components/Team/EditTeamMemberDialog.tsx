
import React, { useEffect, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form } from "@/components/ui/form";
import { updateTeamMember } from "@/services/teamService";
import { TeamMember, departments } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { teamMemberFormSchema, TeamMemberFormValues } from './TeamMemberFormSchema';
import AvatarUpload from './AvatarUpload';
import BasicInfoSection from './BasicInfoSection';
import VacationSection from './VacationSection';
import { Plus, Minus } from 'lucide-react';
import { getProjects } from '@/services/projectService';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditTeamMemberDialogProps {
  member: TeamMember;
  onMemberUpdated: (updatedMember: TeamMember) => void;
  open?: boolean; 
  onOpenChange?: (open: boolean) => void;
}

export default function EditTeamMemberDialog({ 
  member, 
  onMemberUpdated, 
  open, 
  onOpenChange 
}: EditTeamMemberDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const { toast } = useToast();
  
  // Determine which open state to use (controlled or uncontrolled)
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  
  // Fetch projects when dialog opens
  useEffect(() => {
    if (isOpen) {
      const fetchProjects = async () => {
        setIsLoadingProjects(true);
        try {
          const data = await getProjects();
          setProjects(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Error fetching projects:', error);
          toast({
            title: "Error",
            description: "Failed to load projects. Please try again.",
            variant: "destructive"
          });
          setProjects([]);
        } finally {
          setIsLoadingProjects(false);
        }
      };
      
      fetchProjects();
    }
  }, [isOpen, toast]);

  // Convert member's project involvements to the form format
  const projectInvolvements = member.projectInvolvements?.map(involvement => ({
    projectId: involvement.projectId,
    projectName: "",
    percentage: involvement.percentage
  })) || [];
  
  // If there are no project involvements but there are projects, convert those
  if (projectInvolvements.length === 0 && member.projects && member.projects.length > 0) {
    member.projects.forEach(projectId => {
      projectInvolvements.push({
        projectId,
        projectName: "",
        percentage: 100 // Default to 100% involvement
      });
    });
  }
  
  // Add at least one empty project involvement if none exist
  if (projectInvolvements.length === 0) {
    projectInvolvements.push({
      projectId: "",
      projectName: "",
      percentage: 0
    });
  }
  
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: member.name,
      role: member.role,
      department: member.department,
      email: member.email,
      skills: member.skills.join(", "),
      availability: member.availability,
      isOnVacation: member.vacation?.isOnVacation || false,
      vacationStartDate: member.vacation?.startDate || "",
      vacationEndDate: member.vacation?.endDate || "",
      avatar: member.avatar || "",
      projectInvolvements: projectInvolvements,
    },
  });
  
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control: form.control,
    name: "projectInvolvements"
  });
  
  async function onSubmit(values: TeamMemberFormValues) {
    try {
      // Process project involvements - handle both projectId and projectName
      const processedProjectInvolvements = values.projectInvolvements?.filter(p => p.projectId || p.projectName).map(p => ({
        projectId: p.projectId || `custom-${p.projectName?.replace(/\s+/g, '-').toLowerCase()}`,
        percentage: p.percentage
      }));
      
      // Get project IDs for the projects array
      const projectIds = processedProjectInvolvements?.map(p => p.projectId) || [];
      
      const updatedMember = await updateTeamMember(member.id, {
        name: values.name,
        role: values.role,
        department: values.department,
        email: values.email,
        skills: values.skills ? values.skills.split(",").map(skill => skill.trim()).filter(Boolean) : member.skills,
        availability: values.availability,
        vacation: {
          isOnVacation: values.isOnVacation,
          startDate: values.vacationStartDate || undefined,
          endDate: values.vacationEndDate || undefined,
        },
        avatar: values.avatar || member.avatar,
        projectInvolvements: processedProjectInvolvements,
        projects: projectIds
      });
      
      onMemberUpdated(updatedMember);
      toast({
        title: "Success",
        description: `${values.name}'s profile has been updated.`,
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating team member:', error);
      toast({
        title: "Error",
        description: "Failed to update team member profile.",
        variant: "destructive",
      });
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Team Member</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Avatar Upload Section */}
              <AvatarUpload 
                control={form.control} 
                defaultAvatar={member.avatar} 
                name="avatar"
                memberName={member.name}
              />
              
              {/* Basic Information Section */}
              <BasicInfoSection 
                control={form.control}
                departments={departments}
              />
              
              {/* Project Involvements Section */}
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-medium">Project Involvements</h3>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={() => appendProject({ projectId: "", projectName: "", percentage: 0 })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Project
                  </Button>
                </div>
                
                {projectFields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2 mb-2">
                    <FormField
                      control={form.control}
                      name={`projectInvolvements.${index}.projectId`}
                      render={({ field: projectField }) => (
                        <FormItem className="flex-1">
                          <FormLabel className={index !== 0 ? "sr-only" : ""}>Project</FormLabel>
                          <div className="flex gap-2">
                            <Select
                              onValueChange={(value) => {
                                projectField.onChange(value);
                                // Clear the custom project name if selecting from dropdown
                                form.setValue(`projectInvolvements.${index}.projectName`, "");
                              }}
                              value={projectField.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={isLoadingProjects ? "Loading..." : "Select project"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="custom">Custom Project</SelectItem>
                                {projects.map((project) => (
                                  <SelectItem key={project.id} value={project.id}>
                                    {project.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {/* Show custom project name input if "Custom Project" is selected */}
                            {projectField.value === "custom" && (
                              <FormField
                                control={form.control}
                                name={`projectInvolvements.${index}.projectName`}
                                render={({ field: customField }) => (
                                  <FormControl>
                                    <Input
                                      placeholder="Enter custom project name"
                                      {...customField}
                                    />
                                  </FormControl>
                                )}
                              />
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`projectInvolvements.${index}.percentage`}
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel className={index !== 0 ? "sr-only" : ""}>%</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {projectFields.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeProject(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Vacation Section */}
              <VacationSection 
                control={form.control}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Update Profile
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
