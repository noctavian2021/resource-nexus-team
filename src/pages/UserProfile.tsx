
import React, { useState } from 'react';
import Header from '@/components/Layout/Header';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, User, Mail, Building2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Define form schema for password change
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], 
});

export default function UserProfile() {
  const { user, changePassword } = useAuth();
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Set up form with validation
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsChangingPassword(true);
    
    try {
      const success = await changePassword(values.currentPassword, values.newPassword);
      
      if (success) {
        toast({
          title: 'Password updated',
          description: 'Your password has been successfully changed.',
        });
        
        // Reset form
        form.reset();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to change password. Please check your current password.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <>
      <Header title="User Profile" />
      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-2xl font-semibold tracking-tight">Your Profile</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your account details and role information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Label>Name</Label>
                  </div>
                  <div className="font-medium">{user.name}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label>Email</Label>
                  </div>
                  <div className="font-medium">{user.email}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <Label>Department</Label>
                  </div>
                  <div className="font-medium">
                    {user.role === 'admin' 
                      ? 'Admin (All Departments)' 
                      : `Department ${user.departmentId}`}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <Label>Role</Label>
                  </div>
                  <div className="font-medium capitalize">
                    {user.role === 'admin' ? 'Administrator' : 'Team Lead'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter your current password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter your new password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Confirm your new password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={isChangingPassword}
                    className="ml-auto"
                  >
                    {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </main>
    </>
  );
}
