
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
import { useNotifications } from '@/hooks/useNotifications';
import { useEmailConfig, EmailConfig } from '@/hooks/useEmailConfig';
import apiRequest from '@/services/api';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { getDepartments } from '@/services/departmentService';
import { useAuth } from '@/context/AuthContext';
import { playNotificationSound } from '@/utils/sound';

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
      
      // Find the actual department lead's email
      let targetDepartmentLeadEmail = '';
      if (targetDepartment && targetDepartment.leadId) {
        // Find the lead user by ID
        const departmentLead = allUsers.find(u => u.id === targetDepartment.leadId);
        if (departmentLead && departmentLead.email) {
          targetDepartmentLeadEmail = departmentLead.email;
          console.log(`Found target department lead email: ${targetDepartmentLeadEmail}`);
        }
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

      // Add notification for the department lead
      addNotification(
        "New Resource Request",
        `${data.title} - Resource request from ${requestingDepartment?.name || 'Admin'}`,
        'request'
      );
      
      // Play notification sound for both sender and receiver
      playNotificationSound().catch(err => {
        console.log('Error playing notification sound in CreateRequestDialog:', err);
      });
      
      // Send email notification if email is configured, using the same approach as SendWelcomeDialog
      if (emailConfig.enabled) {
        try {
          // Ensure email config is normalized correctly
          const normalizedEmailConfig = {
            ...emailConfig,
            port: String(emailConfig.port),
            secure: emailConfig.port === '465' ? true : (emailConfig.port === '587' ? false : emailConfig.secure),
            connectionTimeout: 30000,
            greetingTimeout: 30000
          };
          
          console.log('Sending email notification with config:', {
            enabled: normalizedEmailConfig.enabled,
            provider: normalizedEmailConfig.provider,
            port: normalizedEmailConfig.port,
            secure: normalizedEmailConfig.secure
          });
          
          // First, send to target department lead
          if (targetDepartmentLeadEmail) {
            console.log('Sending email notification to target department lead:', targetDepartmentLeadEmail);
            
            const emailContent = `
              New Resource Request: ${data.title}
              From: ${requestingDepartment?.name || user?.name || 'Admin'}
              Required Skills: ${data.requiredSkills}
              Start Date: ${data.startDate}
              End Date: ${data.endDate}
              
              Description:
              ${data.description}
            `;
            
            const targetResponse = await apiRequest('/email/send-welcome', 'POST', {
              email: targetDepartmentLeadEmail, 
              replacingMember: '',
              additionalNotes: emailContent,
              emailConfig: normalizedEmailConfig
            });
            
            console.log('Email notification sent to target department lead:', targetResponse);
          } else {
            console.warn('Could not find target department lead email. Using fallback address.');
            // Fallback to a generic department email if we can't find the lead's email
            const fallbackEmail = targetDepartment ? 
              `${targetDepartment.name?.toLowerCase().replace(/\s+/g, '')}@example.com` : 
              'no-reply@example.com';
              
            const emailContent = `
              New Resource Request: ${data.title}
              From: ${requestingDepartment?.name || user?.name || 'Admin'}
              Required Skills: ${data.requiredSkills}
              Start Date: ${data.startDate}
              End Date: ${data.endDate}
              
              Description:
              ${data.description}
            `;
            
            const targetResponse = await apiRequest('/email/send-welcome', 'POST', {
              email: fallbackEmail, 
              replacingMember: '',
              additionalNotes: emailContent,
              emailConfig: normalizedEmailConfig
            });
            
            console.log('Email notification sent to fallback address:', targetResponse);
          }
          
          // Always send a copy to the admin email (regardless of who is creating the request)
          const adminEmail = 'admin@example.com';
          
          console.log('Sending email notification to admin:', adminEmail);
          
          const adminContent = `
            Resource Request Details: ${data.title}
            To: ${targetDepartment?.name || 'Target Department'}
            From: ${user?.name || 'Admin'}
            Required Skills: ${data.requiredSkills}
            Start Date: ${data.startDate}
            End Date: ${data.endDate}
            
            Description:
            ${data.description}
          `;
          
          const adminResponse = await apiRequest('/email/send-welcome', 'POST', {
            email: adminEmail,
            replacingMember: '',
            additionalNotes: adminContent,
            emailConfig: normalizedEmailConfig
          });
          
          console.log('Email notification sent to admin:', adminResponse);
          
          // Now send a copy to the requester (if they're not the admin)
          if (user?.email && user.email !== adminEmail) {
            console.log('Sending email notification to requester:', user.email);
            
            const requesterContent = `
              Your Resource Request: ${data.title}
              To: ${targetDepartment?.name || 'Target Department'}
              Required Skills: ${data.requiredSkills}
              Start Date: ${data.startDate}
              End Date: ${data.endDate}
              
              Description:
              ${data.description}
            `;
            
            const requesterResponse = await apiRequest('/email/send-welcome', 'POST', {
              email: user.email,
              replacingMember: '',
              additionalNotes: requesterContent,
              emailConfig: normalizedEmailConfig
            });
            
            console.log('Email notification sent to requester:', requesterResponse);
          }
          
          console.log('Email notification for request sent successfully');
        } catch (error) {
          console.error('Failed to send email notification:', error);
        }
      } else {
        // Log why email wasn't sent
        console.log('Email notification not sent:', {
          emailEnabled: emailConfig.enabled,
          hasTargetDepartment: !!targetDepartment,
          targetDepartmentId: data.targetDepartmentId,
          targetDepartmentName: targetDepartment?.name
        });
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
