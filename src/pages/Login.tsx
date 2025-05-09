
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Building2, Lock, Mail, ShieldAlert } from 'lucide-react';
import { apiRateLimiter } from '@/utils/security';

// Logger utility
const logger = {
  log: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[LOGIN] ${message}`, ...args);
    }
  }
};

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const { user, login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      logger.log("User already logged in, redirecting to dashboard");
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    // Apply rate limiting to prevent brute force
    if (!apiRateLimiter.check('login')) {
      toast({
        title: "Too many login attempts",
        description: "Please try again later",
        variant: "destructive",
      });
      return;
    }

    logger.log("Attempting login with:", data.email);
    const success = await login(data.email, data.password);
    
    if (success) {
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      // Get the intended destination or default to dashboard
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } else {
      toast({
        title: "Login failed",
        description: error || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  // If already logged in, don't render form
  if (user) {
    return null;
  }

  // Demo login credentials
  const demoAccounts = [
    { role: 'Team Lead 1', email: 'john@example.com', password: 'password123', dept: 'Engineering' },
    { role: 'Team Lead 2', email: 'jane@example.com', password: 'password123', dept: 'Marketing' },
    { role: 'Admin', email: 'admin@example.com', password: 'admin123', dept: 'All Departments' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">TeamSphere</h1>
          <p className="mt-2 text-gray-600">Sign in to your team lead account</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Team Lead Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your department's resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    autoComplete="username"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-10"
                    autoComplete="current-password"
                    {...register('password', { required: 'Password is required' })}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Demo Accounts</span>
                </div>
              </div>
              
              <div className="grid gap-2">
                {demoAccounts.map((account, idx) => (
                  <div key={idx} className="text-xs rounded-md border p-2">
                    <div className="font-semibold flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {account.role} ({account.dept})
                    </div>
                    <div className="text-muted-foreground">
                      Email: {account.email}
                    </div>
                    <div className="text-muted-foreground">
                      Password: {account.password}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
