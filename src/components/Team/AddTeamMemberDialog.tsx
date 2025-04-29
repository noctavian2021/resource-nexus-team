import React from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Plus, Minus, UserCheck, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { departments, projects, TeamMember } from '@/data/mockData';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createTeamMember, ProjectInvolvement, RequiredResource, OfficeDays } from '@/services/teamService';

const resourceTypes = [
  { value: 'account', label: 'Account' },
  { value: 'permission', label: 'Permission' },
  { value: 'url', label: 'URL Link' },
  { value: 'vpn', label: 'VPN Access' },
  { value: 'other', label: 'Other' },
];

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.string().min(2, "Role is required"),
  department: z.string().min(1, "Department is required"),
  avatar: z.string().url("Must be a valid URL").or(z.literal("")),
  skills: z.string().transform(val => val.split(',').map(skill => skill.trim()).filter(Boolean)),
  availability: z.number().min(0).max(100),
  isLead: z.boolean().default(false),
  isDirector: z.boolean().default(false),
  projectInvolvements: z.array(
    z.object({
      projectId: z.string().min(1, "Project is required"),
      percentage: z.number().min(0).max(100, "Percentage must be between 0 and 100")
    })
  ),
  requiredResources: z.array(
    z.object({
      type: z.string().min(1, "Resource type is required"),
      name: z.string().min(1, "Resource name is required"),
      description: z.string()
    })
  ),
  officeDays: z.object({
    monday: z.boolean().default(false),
    tuesday: z.boolean().default(false),
    wednesday: z.boolean().default(false),
    thursday: z.boolean().default(false),
    friday: z.boolean().default(false)
  })
});

type FormValues = z.infer<typeof formSchema>;

interface AddTeamMemberDialogProps {
  onMemberAdded?: (member: TeamMember) => void;
}

export default function AddTeamMemberDialog({ onMemberAdded }: AddTeamMemberDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      department: "",
      avatar: "",
      skills: [],
      availability: 100,
      isLead: false,
      isDirector: false,
      projectInvolvements: [{ projectId: "", percentage: 0 }],
      requiredResources: [],
      officeDays: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false
      }
    }
  });
  
  // Watch for the isDirector field to auto-set the role
  const isDirector = form.watch('isDirector');
  React.useEffect(() => {
    if (isDirector) {
      form.setValue('role', 'Director');
    }
  }, [isDirector, form]);

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control: form.control,
    name: "projectInvolvements"
  });
  
  const { fields: resourceFields, append: appendResource, remove: removeResource } = useFieldArray({
    control: form.control,
    name: "requiredResources" 
  });
  
  const onSubmit = async (data: FormValues) => {
    try {
      const avatarUrl = data.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`;

      const projectInvolvements: ProjectInvolvement[] = data.projectInvolvements.map(p => ({
        projectId: p.projectId,
        percentage: p.percentage
      }));
      
      const requiredResources: RequiredResource[] = data.requiredResources.map(r => ({
        type: r.type,
        name: r.name,
        description: r.description
      }));
      
      const officeDays: OfficeDays = {
        monday: !!data.officeDays.monday,
        tuesday: !!data.officeDays.tuesday,
        wednesday: !!data.officeDays.wednesday,
        thursday: !!data.officeDays.thursday,
        friday: !!data.officeDays.friday
      };

      // Set the role to "Director" if isDirector is true
      const role = data.isDirector ? 'Director' : data.role;

      const newMember = await createTeamMember({
        name: data.name,
        email: data.email,
        role,
        department: data.department,
        avatar: avatarUrl,
        skills: Array.isArray(data.skills) ? data.skills : [data.skills],
        availability: data.availability,
        isLead: data.isLead,
        isDirector: data.isDirector,
        projects: data.projectInvolvements.map(p => p.projectId),
        projectInvolvements,
        requiredResources,
        officeDays
      });

      // Display an appropriate toast message depending on role
      if (data.isDirector) {
        toast({
          title: "Director added",
          description: `${data.name} has been added as a Director with full access.`
        });
      } else if (data.isLead) {
        toast({
          title: "Team member added as department lead",
          description: `${data.name} has been added as the ${data.department} department lead.`
        });
      } else {
        toast({
          title: "Team member added",
          description: `${data.name} has been added to the team.`
        });
      }

      setIsOpen(false);
      form.reset();
      
      if (onMemberAdded) {
        onMemberAdded(newMember);
      }
    } catch (error) {
      console.error("Error adding team member:", error);
      toast({
        title: "Error",
        description: "Failed to add team member. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Team Member</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Software Engineer"
                        disabled={form.watch('isDirector')} 
                        {...field}
                        value={form.watch('isDirector') ? 'Director' : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
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
            </div>

            <div className="space-y-4">
              {/* Director Role Option */}
              <FormField
                control={form.control}
                name="isDirector"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          // If setting as Director, unset Lead
                          if (checked) {
                            form.setValue('isLead', false);
                          }
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center">
                        <Building2 className="mr-2 h-4 w-4" />
                        Designate as Director
                      </FormLabel>
                      <FormDescription>
                        Directors have full access to all departments and projects.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {/* Department Lead Option (only visible if not director) */}
              {!form.watch('isDirector') && (
                <FormField
                  control={form.control}
                  name="isLead"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center">
                          <UserCheck className="mr-2 h-4 w-4" />
                          Designate as Department Lead
                        </FormLabel>
                        <FormDescription>
                          This person will be set as the lead for their department.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="React, TypeScript, Node.js" 
                      {...field}
                      value={Array.isArray(field.value) ? field.value.join(', ') : field.value}  
                    />
                  </FormControl>
                  <FormDescription>
                    Separate skills with commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/avatar.jpg" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Leave blank for a random avatar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium mb-2">Project Involvement</h3>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline"
                  onClick={() => appendProject({ projectId: "", percentage: 0 })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Project
                </Button>
              </div>
              
              {projectFields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2 mb-2">
                  <FormField
                    control={form.control}
                    name={`projectInvolvements.${index}.projectId`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Project</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
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
                  
                  {index > 0 && (
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
            
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium mb-2">Required Resources</h3>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline"
                  onClick={() => appendResource({ type: "", name: "", description: "" })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Resource
                </Button>
              </div>
              
              {resourceFields.map((field, index) => (
                <div key={field.id} className="border rounded-md p-3 mb-3">
                  <div className="flex justify-between mb-2">
                    <h4 className="text-sm font-medium">Resource #{index + 1}</h4>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeResource(index)}
                    >
                      <Minus className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <FormField
                      control={form.control}
                      name={`requiredResources.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select resource type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {resourceTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
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
                      name={`requiredResources.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name/Identifier</FormLabel>
                          <FormControl>
                            <Input placeholder="Resource name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`requiredResources.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Resource details..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Office Days</h3>
              <div className="grid grid-cols-5 gap-2">
                <FormField
                  control={form.control}
                  name="officeDays.monday"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center space-y-1">
                      <FormLabel>Mon</FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="officeDays.tuesday"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center space-y-1">
                      <FormLabel>Tue</FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="officeDays.wednesday"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center space-y-1">
                      <FormLabel>Wed</FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="officeDays.thursday"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center space-y-1">
                      <FormLabel>Thu</FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="officeDays.friday"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center space-y-1">
                      <FormLabel>Fri</FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Team Member</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
