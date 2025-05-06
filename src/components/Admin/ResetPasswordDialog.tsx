
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';

// Create form schema for password reset
const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must be less than 50 characters"),
  confirmPassword: z.string()
    .min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
};

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
}) => {
  const { resetUserPassword } = useAuth();
  const { toast } = useToast();
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    setIsResettingPassword(true);
    console.log(`Attempting to reset password for user ID: ${userId} with name: ${userName}`);

    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      const success = await resetUserPassword(userId, values.newPassword);
      console.log("Password reset result:", success);

      if (success) {
        toast({
          title: 'Password reset',
          description: `Password for ${userName} has been successfully reset.`,
        });
        form.reset();
        handleClose();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to reset password. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: 'Error',
        description: typeof error === 'object' && error !== null ? 
          (error as Error).message || 'An unexpected error occurred.' : 
          'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Set a new password for {userName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      autoComplete="new-password"
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
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isResettingPassword}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isResettingPassword}
              >
                {isResettingPassword ? 'Resetting...' : 'Reset Password'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
