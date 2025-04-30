
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Edit, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { updateTeamMember } from "@/services/teamService";
import { TeamMember, departments } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  role: z.string().min(2, { message: "Role must be at least 2 characters." }),
  department: z.string().min(1, { message: "Please select a department." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  skills: z.string().optional(),
  availability: z.coerce.number().min(0).max(100),
  isOnVacation: z.boolean().default(false),
  vacationStartDate: z.string().optional(),
  vacationEndDate: z.string().optional(),
  avatar: z.string().optional(),
});

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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(member.avatar || null);
  const { toast } = useToast();
  
  // Determine which open state to use (controlled or uncontrolled)
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
  
  // Watch the isOnVacation field to conditionally show date inputs
  const isOnVacation = form.watch("isOnVacation");
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file (JPEG, PNG, GIF, WEBP).",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar image must be less than 2MB.",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      form.setValue("avatar", result);
    };
    reader.readAsDataURL(file);
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

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
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-24 w-24 border-2 border-muted">
                  <AvatarImage src={avatarPreview || member.avatar} />
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <div className="flex items-center justify-center">
                          <label htmlFor="avatar-upload" className="cursor-pointer">
                            <div className="flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
                              <Upload className="h-4 w-4 mr-2" />
                              Change Avatar
                            </div>
                            <input
                              id="avatar-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarChange}
                            />
                          </label>
                        </div>
                      </FormControl>
                      <FormDescription className="text-center text-xs">
                        Upload a new avatar (JPEG, PNG, GIF, WEBP, max 2MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter role" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem key={department.id} value={department.name}>
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter skills separated by commas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="border rounded-md p-3">
                <h3 className="text-md font-medium mb-3">Vacation Information</h3>
                
                <FormField
                  control={form.control}
                  name="isOnVacation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>On Vacation</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {isOnVacation && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <FormField
                      control={form.control}
                      name="vacationStartDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="vacationEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
              
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
