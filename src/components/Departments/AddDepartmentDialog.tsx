
import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TeamMember } from '@/data/mockData';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createDepartment } from '@/services/departmentService';
import { getTeamMembers } from '@/services/teamService';

// Modified schema to make leadId truly optional
const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Please provide a description (min 10 chars)"),
  leadId: z.string().optional(), // Optional leadId
  memberCount: z.number().min(1, "At least one member is required"),
  color: z.string().min(4, "Color is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddDepartmentDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen) {
      const fetchTeamMembers = async () => {
        setLoading(true);
        try {
          const members = await getTeamMembers();
          setTeamMembers(members);
        } catch (error) {
          console.error("Failed to fetch team members:", error);
          toast({
            title: "Notice",
            description: "No team members found. You can add a department without a lead for now.",
          });
        } finally {
          setLoading(false);
        }
      };
      
      fetchTeamMembers();
    }
  }, [isOpen, toast]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      leadId: undefined, // Use undefined for optional leadId
      memberCount: 1,
      color: "#3b82f6", // Default blue color
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    try {
      // No need to handle empty leadId specially - just pass the data as is
      await createDepartment({
        name: data.name,
        description: data.description,
        leadId: data.leadId, // This can be undefined/empty and that's fine
        memberCount: data.memberCount,
        color: data.color
      });

      toast({
        title: "Department added",
        description: `${data.name} department has been created.`
      });

      setIsOpen(false);
      form.reset();
      
      window.location.reload();
    } catch (error) {
      console.error("Error creating department:", error);
      toast({
        title: "Error",
        description: "Failed to add department. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
          <DialogDescription>Create a new department and assign a team lead</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Marketing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the department's responsibilities and purpose"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="leadId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Department Lead
                      <span className="text-xs text-muted-foreground">(Optional)</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loading ? "Loading team members..." : "Select department lead"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teamMembers.length > 0 ? (
                          teamMembers.map((member: TeamMember) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-members" disabled>
                            No team members available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="memberCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Member Count</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Color</FormLabel>
                  <div className="flex gap-3">
                    <FormControl>
                      <Input 
                        type="color"
                        className="w-12 h-10 p-1" 
                        {...field} 
                      />
                    </FormControl>
                    <Input 
                      value={field.value}
                      onChange={field.onChange}
                      className="flex-1"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>Create Department</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
