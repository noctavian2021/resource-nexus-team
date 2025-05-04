import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
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
import { teamMembers } from '@/data/mockData';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const requestFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  targetDepartmentId: z.string().min(1, "Target department is required"),
  targetLeadEmail: z.string().email("Valid email address is required").min(1, "Lead email is required"),
  requiredSkills: z.string().min(1, "Required skills are required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type RequestFormData = z.infer<typeof requestFormSchema>;

export default function CreateRequestDialog() {
  const [open, setOpen] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { addNotification, findDepartmentLeadEmail } = useNotifications();
  const { emailConfig } = useEmailConfig();
  const { user } = useAuth();
  
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
      targetLeadEmail: '',
      requiredSkills: '',
      startDate: '',
      endDate: '',
    }
  });

  // Auto-populate lead email when department is selected
  useEffect(() => {
    const departmentId = form.watch('targetDepartmentId');
    if (departmentId) {
      const targetLeadInfo = findDepartmentLeadEmail(departmentId);
      if (targetLeadInfo.email) {
        form.setValue('targetLeadEmail', targetLeadInfo.email);
      }
    }
  }, [form.watch('targetDepartmentId'), findDepartmentLeadEmail, form]);
  
  const onSubmit = async (data: RequestFormData) => {
    setSending(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      console.log('New request:', data);
      
      const targetDepartment = departmentList.find(dept => dept.id === data.targetDepartmentId);
      const requestingDepartment = departmentList.find(d => d.id === currentUserDepartmentId);
      
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
        
        *** THIS IS A HIGH PRIORITY REQUEST ***
      `;

      // Use the same approach as SendWelcomeDialog - direct API call
      try {
        // First, make a direct API call to send the email with appropriate resource request subject and content
        const response = await fetch('http://localhost:5000/api/email/send-welcome', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: data.targetLeadEmail,
            name: targetDepartment?.name || 'Department Lead',
            subject: `Resource Request: ${data.title}`,
            // Override the default email template content by setting custom fields
            isResourceRequest: true, // Signal this is not a regular welcome email
            startDate: data.startDate,
            endDate: data.endDate,
            replacingMember: '', // Not relevant for resource requests
            additionalNotes: `
              RESOURCE REQUEST FROM ${requestingDepartment?.name || user?.name || 'Admin'}
              
              ${data.title}
              
              Description:
              ${data.description}
              
              Required Skills: ${data.requiredSkills}
              Requested Duration: ${data.startDate} to ${data.endDate}
              
              Please review this resource request at your earliest convenience.
              This request requires your attention in the Resource Management System.
            `,
            emailConfig: {
              ...emailConfig,
              port: String(emailConfig.port),
              secure: emailConfig.port === '465' ? true : (emailConfig.port === '587' ? false : emailConfig.secure),
              connectionTimeout: 30000,
              greetingTimeout: 30000
            }
          })
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to send email');
        }
        
        console.log('Email sent successfully:', result);
        
      } catch (emailError) {
        console.error('Error sending email via API:', emailError);
        setError(`Failed to send email: ${emailError}`);
      }

      // Also add notification for the system
      await addNotification(
        "New Resource Request",
        `${data.title} - Resource request from ${requestingDepartment?.name || 'Admin'}`,
        'request',
        {
          emailRecipient: data.targetLeadEmail,
          targetDepartmentId: data.targetDepartmentId, 
          additionalEmailContent: additionalEmailContent
        }
      );
      
      // Play notification sound
      playNotificationSound().catch(err => {
        console.log('Error playing notification sound in CreateRequestDialog:', err);
      });
      
      // Send confirmation email to requester if different from target
      if (user?.email && user.email !== data.targetLeadEmail) {
        // Send copy to requester with different message
        try {
          await fetch('http://localhost:5000/api/email/send-welcome', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name || 'User',
              subject: `Your Resource Request: ${data.title} - Confirmation`,
              isResourceRequest: true, // Signal this is not a regular welcome email
              startDate: data.startDate,
              endDate: data.endDate,
              replacingMember: '',
              additionalNotes: `
                RESOURCE REQUEST CONFIRMATION
                
                Your request "${data.title}" has been submitted to ${targetDepartment?.name || 'the department'}.
                You will be notified when there is an update.
                
                Request Details:
                Description: ${data.description}
                Required Skills: ${data.requiredSkills}
                Duration: ${data.startDate} to ${data.endDate}
                
                Thank you for submitting your request through the Resource Management System.
              `,
              emailConfig: {
                ...emailConfig,
                port: String(emailConfig.port),
                secure: emailConfig.port === '465' ? true : (emailConfig.port === '587' ? false : emailConfig.secure),
                connectionTimeout: 30000,
                greetingTimeout: 30000
              }
            })
          });
        } catch (confirmError) {
          console.error('Error sending confirmation email:', confirmError);
        }
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
          <DialogDescription>
            Fill out this form to request resources from another department.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!emailConfig.enabled && (
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-800">Email notifications not enabled</AlertTitle>
            <AlertDescription className="text-amber-700">
              Email notifications are currently disabled. The request will be processed but no email will be sent.
            </AlertDescription>
          </Alert>
        )}
        
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
              name="targetLeadEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Lead Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Department lead email" 
                      type="email"
                      {...field} 
                    />
                  </FormControl>
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
