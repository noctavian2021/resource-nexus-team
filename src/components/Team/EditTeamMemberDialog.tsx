
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  const { toast } = useToast();
  
  // Determine which open state to use (controlled or uncontrolled)
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  
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
    },
  });
  
  async function onSubmit(values: TeamMemberFormValues) {
    try {
      const updatedMember = await updateTeamMember(member.id, {
        name: values.name,
        role: values.role,
        department: values.department,
        email: values.email,
        skills: values.skills ? values.skills.split(",").map(skill => skill.trim()) : member.skills,
        availability: values.availability,
        vacation: {
          isOnVacation: values.isOnVacation,
          startDate: values.vacationStartDate || undefined,
          endDate: values.vacationEndDate || undefined,
        },
        avatar: values.avatar || member.avatar,
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
