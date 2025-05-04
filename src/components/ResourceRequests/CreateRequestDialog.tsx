import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ResourceRequest } from '@/data/mockData';
import { PlusCircle, Mail } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { useNotifications, NotificationOptions } from '@/hooks/useNotifications';
import { useEmailConfig } from '@/hooks/useEmailConfig';
import { useQuery } from '@tanstack/react-query';
import { getDepartments } from '@/services/departmentService';
import { useAuth } from '@/context/AuthContext';
import { playNotificationSound } from '@/utils/sound';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const requestFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  targetDepartmentId: z.string().min(1, "Target department is required"),
  requiredSkills: z.string().min(1, "Required skills are required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type RequestFormData = z.infer<typeof requestFormSchema>;

export default function CreateRequestDialog() {
  const [open, setOpen] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const { addNotification } = useNotifications();
  const { emailConfig } = useEmailConfig();
  const { user, getAllUsers } = useAuth();
  
  // Get all users for mapping department leads
  const allUsers = getAllUsers();
  console.log('Available users for email lookup:', allUsers);
  
  // Fetch departments using React Query
  const { data: departmentList = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments
  });

  // Get current user's department ID from auth context
  const currentUserDepartmentId = user?.departmentId || '';
  
  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: '',
      description: '',
      targetDepartmentId: '',
      requiredSkills: '',
      startDate: '',
      endDate: '',
    }
  });

  const onSubmit = async (data: RequestFormData) => {
    setSending(true);
    
    try {
      // In a real app, this would be an API call
      console.log('New request:', data);
      
      const targetDepartment = departmentList.find(dept => dept.id === data.targetDepartmentId);
      const requestingDepartment = departmentList.find(d => d.id === currentUserDepartmentId);
      
      // Find the department lead's information
      let targetLeadEmail = '';
      let targetLeadName = '';
      
      // Improve debugging for the lookup process
      console.log('Looking up department lead for department:', targetDepartment);
      console.log('Department lead ID to find:', targetDepartment?.leadId);
      console.log('Current users available:', allUsers);
      
      // Get directly from API if allUsers is empty
      if (targetDepartment?.leadId && (!allUsers || allUsers.length === 0)) {
        try {
          // In a real app, you would fetch the user directly
          console.log(`Attempting direct fetch for lead with ID: ${targetDepartment.leadId}`);
          
          // Mock getting the user email from departmentId - in real app would be API call
          targetLeadEmail = `${targetDepartment.name?.toLowerCase().replace(/\s+/g, '')}lead@example.com`;
          targetLeadName = `${targetDepartment.name} Lead`;
          console.log(`Using mock email for department lead: ${targetLeadEmail}`);
        } catch (error) {
          console.error('Error fetching department lead:', error);
        }
      } else if (targetDepartment?.leadId) {
        // Find lead in allUsers array
        const departmentLead = allUsers.find(u => u.id === targetDepartment.leadId);
        console.log('Department lead found:', departmentLead);
        
        if (departmentLead && departmentLead.email) {
          targetLeadEmail = departmentLead.email;
          targetLeadName = departmentLead.name || 'Department Lead';
          console.log(`Found target department lead email: ${targetLeadEmail} (${targetLeadName})`);
        }
      }
      
      // If still no email, create a fallback
      if (!targetLeadEmail && targetDepartment) {
        targetLeadEmail = `${targetDepartment.name?.toLowerCase().replace(/\s+/g, '')}@example.com`;
        targetLeadName = targetDepartment.name || 'Department';
        console.log(`Using fallback email: ${targetLeadEmail}`);
      }
      
      // Modified to match the ResourceRequest interface
      const newRequest: Partial<ResourceRequest> = {
        id: `request-${Date.now()}`,
        requesterId: user?.id || '',
        projectId: '',
        departmentId: currentUserDepartmentId, 
        requestingDepartmentId: currentUserDepartmentId,
        targetDepartmentId: data.targetDepartmentId,
        title: data.title,
        description: data.description,
        requiredSkills: data.requiredSkills.split(',').map(skill => skill.trim()),
        skillsRequired: data.requiredSkills.split(',').map(skill => skill.trim()),
        roleNeeded: '',
        startDate: data.startDate,
        endDate: data.endDate,
        status: "pending", 
        priority: 'Medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Enhanced email content for better readability
      const additionalEmailContent = `
        Required Skills: ${data.requiredSkills}
        Duration: ${data.startDate} to ${data.endDate}
        From Department: ${requestingDepartment?.name || user?.name || 'Admin'}
        
        Please review this request in the Resource Management System.
      `;

      // Add notification for the department lead with specific email targeting
      const notificationOptions: NotificationOptions = {
        emailRecipient: targetLeadEmail,
        recipientName: targetLeadName,
        additionalEmailContent: additionalEmailContent
      };
      
      // Add system notification with email
      await addNotification(
        "New Resource Request",
        `${data.title} - Resource request from ${requestingDepartment?.name || 'Admin'}`,
        'request',
        notificationOptions
      );
      
      // Play notification sound for both sender and receiver
      playNotificationSound().catch(err => {
        console.log('Error playing notification sound in CreateRequestDialog:', err);
      });
      
      // Send confirmation email to requester if different from target
      if (user?.email && user.email !== targetLeadEmail) {
        // Send copy to requester with different message
        const requesterOptions: NotificationOptions = {
          emailRecipient: user.email,
          recipientName: user.name || 'User',
          skipEmail: !emailConfig.enabled,
          additionalEmailContent: `
            Your request has been submitted to ${targetDepartment?.name || 'the department'}.
            You will be notified when there is an update.
          `
        };
        
        await addNotification(
          `Your Resource Request: ${data.title}`,
          `Your request has been submitted to ${targetDepartment?.name}`,
          'general',
          requesterOptions
        );
      }
      
      // Show confirmation toast to the requester
      toast({
        title: "Request Sent",
        description: `Your resource request "${data.title}" has been sent to ${targetDepartment?.name}. They will review it shortly.`,
      });
      
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error submitting request:', error);
      
      toast({
        title: "Error",
        description: "Failed to submit resource request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Resource Request</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter request title" {...field} />
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
                    <Textarea placeholder="Describe your resource needs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="targetDepartmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Department</FormLabel>
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
                      {isLoadingDepartments ? (
                        <SelectItem value="loading">Loading departments...</SelectItem>
                      ) : (
                        departmentList
                          .filter(dept => dept.id !== currentUserDepartmentId) // Filter out current department
                          .map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="requiredSkills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Skills</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., React, TypeScript (comma separated)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
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
                name="endDate"
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
            
            <div className="flex justify-end gap-2">
              <Button 
                type="submit" 
                disabled={sending}
                className="flex items-center gap-2"
              >
                {sending ? 'Submitting...' : 'Submit Request'}
                {!sending && <Mail className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
