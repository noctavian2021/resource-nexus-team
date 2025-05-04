
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
import { teamMembers } from '@/data/mockData';

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
      requiredSkills: '',
      startDate: '',
      endDate: '',
    }
  });

  // Function to send a test email to verify configuration
  const sendTestEmailToMirela = async () => {
    try {
      console.log('🚨 SENDING TEST EMAIL TO MIRELA');
      const mirelaMember = teamMembers.find(m => m.name.toLowerCase().includes('mirela'));
      
      if (mirelaMember && emailConfig.enabled) {
        console.log(`Found Mirela: ${mirelaMember.name} with email ${mirelaMember.email}`);
        
        const testEmailResult = await fetch('http://localhost:5000/api/email/send-test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            config: {
              ...emailConfig,
              port: String(emailConfig.port),
              secure: emailConfig.port === '465' ? true : (emailConfig.port === '587' ? false : emailConfig.secure),
            },
            recipient: mirelaMember.email,
            subject: 'URGENT TEST: Product Department Request',
            text: 'This is a DIRECT test email to verify you are receiving Product department notifications.',
            html: '<h1>Product Department Test Notification</h1><p>This is a DIRECT test email to verify you are receiving Product department notifications.</p>'
          })
        }).then(res => res.json());
        
        console.log('Test email response:', testEmailResult);
        return testEmailResult;
      }
      
      return { success: false, error: 'Email not enabled or Mirela not found' };
    } catch (error) {
      console.error('Error sending test email to Mirela:', error);
      return { success: false, error: String(error) };
    }
  };
  
  const onSubmit = async (data: RequestFormData) => {
    setSending(true);
    
    try {
      // In a real app, this would be an API call
      console.log('New request:', data);
      
      const targetDepartment = departmentList.find(dept => dept.id === data.targetDepartmentId);
      const requestingDepartment = departmentList.find(d => d.id === currentUserDepartmentId);
      
      if (targetDepartment) {
        console.log(`Target department: ${targetDepartment.name} (ID: ${targetDepartment.id})`);
        console.log(`Target department lead ID: ${targetDepartment.leadId}`);
      } else {
        console.log(`Target department with ID ${data.targetDepartmentId} not found in list`);
      }
      
      // Check if this is for Product department
      const isProductDepartment = targetDepartment?.name === 'Product';
      
      // Find Mirela directly if sending to Product department
      let targetLeadEmail = '';
      let targetLeadName = '';
      
      // Always use Mirela for Product department (revised logic)
      const mirela = teamMembers.find(member => 
        member.name.toLowerCase().includes('mirela')
      );
      
      if (mirela) {
        // If this is for Product department, directly use Mirela
        if (isProductDepartment) {
          targetLeadEmail = mirela.email;
          targetLeadName = mirela.name;
          console.log(`🔔 DIRECTLY USING MIRELA: ${targetLeadName} (${targetLeadEmail})`);
          
          // Send a test message to verify
          sendTestEmailToMirela().then(result => {
            if (!result.success) {
              console.error('Test email to Mirela failed:', result.error);
            } else {
              console.log('Test email to Mirela succeeded!');
            }
          });
        } 
        // For other departments, use standard lookup but with a backup option
        else {
          const targetLeadInfo = findDepartmentLeadEmail(data.targetDepartmentId);
          targetLeadEmail = targetLeadInfo.email;
          targetLeadName = targetLeadInfo.name;
          
          // If we couldn't find a lead, CC Mirela anyway
          if (!targetLeadEmail) {
            targetLeadEmail = mirela.email;
            targetLeadName = mirela.name;
            console.log(`⚠️ Using Mirela as fallback for department ${targetDepartment?.name}: ${targetLeadName} (${targetLeadEmail})`);
          } else {
            console.log(`Using department lead: ${targetLeadName} (${targetLeadEmail})`);
          }
        }
      } else {
        console.log('⚠️ WARNING: Mirela not found in team members list! Using standard lookup.');
        
        // Fall back to standard department lead lookup
        const targetLeadInfo = findDepartmentLeadEmail(data.targetDepartmentId);
        targetLeadEmail = targetLeadInfo.email;
        targetLeadName = targetLeadInfo.name;
      }
      
      // Debug logging
      console.log(`Final recipient: ${targetLeadName} (${targetLeadEmail})`);
      
      if (isProductDepartment) {
        console.log(`⚠️ ATTENTION: Sending to Product department, recipient: ${targetLeadName} (${targetLeadEmail})`);
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
        
        *** THIS IS A HIGH PRIORITY REQUEST ***
      `;

      // Email debug info
      console.log(`Email enabled: ${emailConfig.enabled}`);
      if (emailConfig.enabled) {
        console.log(`From: ${emailConfig.fromEmail} (${emailConfig.fromName})`);
        console.log(`SMTP: ${emailConfig.host}:${emailConfig.port} (secure: ${emailConfig.secure})`);
      }

      // Add notification for the department lead with specific email targeting
      const notificationOptions: NotificationOptions = {
        emailRecipient: targetLeadEmail,
        recipientName: targetLeadName,
        targetDepartmentId: data.targetDepartmentId, 
        additionalEmailContent: additionalEmailContent,
        // Force Mirela as recipient if this is for Product department
        forceMirelaAsRecipient: isProductDepartment
      };
      
      console.log(`Sending notification with options:`, JSON.stringify(notificationOptions, null, 2));
      
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
      
      // Also CC Mirela on all department communications if not already the target
      if (mirela && !isProductDepartment && targetLeadEmail !== mirela.email && emailConfig.enabled) {
        const mirelaOptions: NotificationOptions = {
          emailRecipient: mirela.email,
          recipientName: mirela.name,
          skipEmail: !emailConfig.enabled,
          additionalEmailContent: `
            This is a CC of a request sent to ${targetDepartment?.name || 'another department'}.
            Original recipient: ${targetLeadName} (${targetLeadEmail})
            
            ${additionalEmailContent}
          `
        };
        
        await addNotification(
          `CC: Resource Request for ${targetDepartment?.name}`,
          `${data.title} - Resource request from ${requestingDepartment?.name || 'Admin'}`,
          'request',
          mirelaOptions
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
